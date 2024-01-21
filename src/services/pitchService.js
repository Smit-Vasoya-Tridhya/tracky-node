const logger = require("../logger");
const { OpenAI } = require("openai");
const Pitch = require("../models/pitchGeneratorSchema");
const { returnMessage } = require("../utils/utils");

const ai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class PitchService {
  promptMaker = (payload) => {
    try {
      const system_role = {
        role: "system",
        content: `Act like you are ${payload?.selected_role} to make a pitch and never leave that role.`,
      };
      let template_questions = "";
      payload.template.forEach((temp, index) => {
        const question = temp?.key;
        const answer = temp?.value;

        template_questions += `
        ${index + 1} Question: ${question}
                     Answer: ${answer} \n`;
      });

      const prompt = `
      Provide information for ${payload?.user_prompt} based on the below questions and answers.
      So generate the best overall speech by considering the questions and it's answers and give 
      the result as a overall, do not give response with question based.Please provide the response
      in the well format so it should contain new line, proper paragraph, proper link, etc. 
      whatever is required to show the response to the html file.
      ${template_questions}.`;

      console.log(prompt);

      return [system_role, { role: "user", content: prompt }];
    } catch (error) {
      logger.error(`Error while making prompt:${error}`);
      return false;
    }
  };

  openAiChat = async (prompt) => {
    try {
      prompt.forEach((p) => {
        if (p.date) delete p.date;
        if (p._id) delete p._id;
      });
      const completion = await ai_client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: prompt,
        stream: true,
      });
      return { completion, success: true };
    } catch (error) {
      logger.error(`Error while openAI chat generation: ${error.message}`);
      return { success: false };
    }
  };

  newPitch = async (payload, user) => {
    try {
      const prompt = this.promptMaker(payload);
      if (!prompt) return returnMessage("default");

      const openai_chat = await this.openAiChat(prompt);
      if (!openai_chat?.success) return returnMessage("default");

      const pitch = await Pitch.create({
        _id: payload?._id,
        user_id: user?._id,
        history: prompt,
        selected_role: payload?.selected_role,
        user_prompt: payload?.user_prompt,
      });

      return {
        pitch,
        openai_chat: openai_chat?.completion,
      };
    } catch (error) {
      logger.error(`Error while making new pitch: ${error.message}`);
      return error.message;
    }
  };

  getPitch = async (pitch_id, user) => {
    try {
      const pitch = await Pitch.findOne({
        _id: pitch_id,
        user_id: user?._id,
      }).lean();
      pitch.history.splice(0, 2);
      return pitch;
    } catch (error) {
      logger.error(`Error while getting the Pitch: ${error}`);
      return error.message;
    }
  };

  updatePitch = async (pitch_id, payload, user) => {
    try {
      await Pitch.findOneAndUpdate(
        { _id: pitch_id, user_id: user?._id },
        { name: payload?.name }
      );
      return;
    } catch (error) {
      logger.error(`Error while updating the pitch: ${error}`);
      return error.message;
    }
  };

  continuePitch = async (pitch_id, payload, user) => {
    try {
      const pitch = await Pitch.findOne({
        _id: pitch_id,
        user_id: user?._id,
      }).lean();
      if (!pitch) return returnMessage("pitchNotFound");

      let history = pitch.history;

      history.push({ role: "user", content: payload?.user_prompt });

      await Pitch.findByIdAndUpdate(pitch_id, { history }, { new: true });

      const openai_chat = await this.openAiChat(history);
      if (!openai_chat?.success) return returnMessage("default");

      return {
        pitch,
        openai_chat: openai_chat?.completion,
      };
    } catch (error) {
      logger.error(`Error while contineing pitch: ${error}`);
      return error?.message;
    }
  };

  getAllPitch = async (user) => {
    try {
      return await Pitch.find({ user_id: user?._id }).select("name").lean();
    } catch (error) {
      logger.error(`Error while getting all pitch: ${error}`);
    }
  };
}

module.exports = PitchService;

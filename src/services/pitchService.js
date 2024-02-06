const logger = require("../logger");
const { OpenAI } = require("openai");
const Pitch = require("../models/pitchGeneratorSchema");
const { returnMessage } = require("../utils/utils");

const ai_client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

class PitchService {
  promptMaker = (payload, name) => {
    try {
      const system_role = {
        role: "system",
        content: `Immerse yourself in the ${payload?.selected_role} of a skilled sales professional and deliver a compelling pitch. Stay in character throughout the interaction.`,
      };
      let template_questions = "";
      payload.template.forEach((temp, index) => {
        const question = temp?.key;
        const answer = temp?.value;

        template_questions += `${
          index + 1
        } Question: ${question} \n\t Answer: ${answer} \n`;
      });

      // const prompt = `Provide information for ${payload?.user_prompt} based on the below questions and answers.
      // Generate the overall speech by considering the questions and it's answers and give the
      // result as a overall and short, do not give response with question based.
      // Please provide in well manner format.\n
      // ${template_questions}.`;

      // Prompt provided by the client
      const prompt = `My name is ${name}. Generate a concise and impactful sales pitch by incorporating the provided questions and answers seamlessly. Craft the speech in a well-structured format, avoiding question-based responses. Begin with an engaging introduction using placeholders like ‘Hey, it’s ,’ and ensure the pitch is both concise and highly persuasive. Strive for a short but powerful presentation that leaves a lasting impression.
      ${template_questions}`;

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
        max_tokens: 300,
      });
      return { completion, success: true };
    } catch (error) {
      logger.error(`Error while openAI chat generation: ${error.message}`);
      return { success: false };
    }
  };

  textToSpeech = async (prompt) => {
    try {
      prompt.forEach((p) => {
        if (p.date) delete p.date;
        if (p._id) delete p._id;
      });
      const completion = await ai_client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: prompt,
        max_tokens: 300,
      });
      const mp3 = await ai_client.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: completion?.choices[0]?.message?.content,
      });
      return { mp3, success: true };
    } catch (error) {
      logger.error(`Error while openAI chat generation: ${error.message}`);
      return { success: false };
    }
  };

  newPitch = async (payload, user) => {
    try {
      const name = user?.user_name || user?.first_name + " " + user?.last_name;
      const prompt = this.promptMaker(payload, name);
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
      pitch?.history.splice(0, 2);
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
      return await Pitch.find({ user_id: user?._id, type: "pitch" }).lean();
    } catch (error) {
      logger.error(`Error while getting all pitch: ${error}`);
    }
  };
}

module.exports = PitchService;

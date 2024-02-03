const Pitch = require("../models/pitchGeneratorSchema");
const logger = require("../logger");
const PitchService = require("./pitchService");
const pitchService = new PitchService();

class ConvoCraftService {
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
        const level = temp?.level;
        if (level) {
          template_questions += `${
            index + 1
          } Question: ${question} \n\t Answer: The level of objection is ${level} and  ${answer} \n`;
        } else {
          template_questions += `${
            index + 1
          } Question: ${question} \n\t Answer: ${answer} \n`;
        }
      });
      const prompt = `My name is ${name}. Generate a concise and impactful sales pitch by incorporating the provided questions and answers seamlessly. Craft the speech in a well-structured format, avoiding question-based responses. Begin with an engaging introduction using placeholders like ‘Hey, it’s ,’ and ensure the pitch is both concise and highly persuasive. Strive for a short but powerful presentation that leaves a lasting impression.
      ${template_questions}`;

      return [system_role, { role: "user", content: prompt }];
    } catch (error) {
      logger.error(`Error while making prompt for the convo:${error}`);
      return false;
    }
  };

  createConvoCall = async (payload, user) => {
    try {
      const name = user?.user_name || user?.first_name + " " + user?.last_name;
      const prompt = this.promptMaker(payload, name);
      if (!prompt) return returnMessage("default");

      const openai_audio = await pitchService.textToSpeech(prompt);
      if (!openai_audio?.success) return returnMessage("default");

      await Pitch.create({
        _id: payload?._id,
        user_id: user?._id,
        history: prompt,
        selected_role: payload?.selected_role,
        user_prompt: payload?.user_prompt,
        type: "convo",
      });

      return {
        openai_audio: openai_audio?.mp3,
      };
    } catch (error) {
      logger.error(`Error while making new convo call: ${error}`);
      return error.message;
    }
  };

  continueConvoCall = async (convo_call_id, payload, user) => {
    try {
      const convo_call = await Pitch.findOne({
        _id: pitch_id,
        user_id: user?._id,
        type: "convo",
      }).lean();
      if (!convo_call) return returnMessage("convoCallNotFound");

      let history = convo_call.history;

      history.push({ role: "user", content: payload?.user_prompt });

      await Pitch.findByIdAndUpdate(convo_call_id, { history }, { new: true });

      const openai_chat = await pitchService.textToSpeech(history);
      if (!openai_chat?.success) return returnMessage("default");

      return {
        openai_chat: openai_chat?.mp3,
      };
    } catch (error) {
      logger.error(`Error while continuing convo: ${error}`);
      return error?.message;
    }
  };

  getAllConvoCall = async (user) => {
    try {
      return await Pitch.find({ user_id: user?._id, type: "convo" }).lean();
    } catch (error) {
      logger.error(`Error while getting all convo call: ${error}`);
    }
  };

  // redoConvoCall =  async (convo_call_id)=>{

  // }

  // deleteConvoCall = async (user) => {
  //   try {
  //     return await Pitch.find({ user_id: user?._id, type: "convo" }).lean();
  //   } catch (error) {
  //     logger.error(`Error while getting all convo call: ${error}`);
  //   }
  // };
}

module.exports = ConvoCraftService;

import cloudinary from "../config/cloudinary.config";

const apiSecret = cloudinary.v2.config().api_secret;
if (!apiSecret) {
  throw new Error("API secret is not defined");
}

const signuploadform = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  const signature = cloudinary.v2.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "tailorhubchallenge",
    },
    apiSecret
  );

  return { timestamp, signature };
};

export default {
  signuploadform,
};

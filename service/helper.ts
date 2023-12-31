import JwtWebToken from "jsonwebtoken";
import { SECRET_KEY } from "../config";
import { IUser } from "../service/interfaces";

/**
 * Generate User Token Infomation by jsonwebtoken
 * @param user
 * @returns
 */

export const generateToken = (user: IUser) => {
  return JwtWebToken.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: user.password,
      isVerified: user.isVerified,
      token: user.token,
      passwordToken: user.passwordToken,
      reviewCount: user.reviewCount,
      reviewMark: user.reviewMark,
      bio: user.bio,
      userName: user.userName,
      telephoneNumber: user.telephoneNumber,
      phoneNumberShare: user.phoneNumberShare,
      avatar: user.avatar,
      adCount: user.adCount,
    },
    SECRET_KEY,
    {
      expiresIn: 60 * 60 * 24,
    }
  );
};

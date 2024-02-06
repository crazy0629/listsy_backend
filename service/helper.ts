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

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const earthRadiusMiles = 3958.8; // Earth's radius in miles

  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusMiles * c;

  return distance;
};

export const checkPriceMatches = (minPrice, maxPrice, obj) => {
  let minPriceCondition = true;
  let maxPriceCondition = true;
  if (minPrice != "")
    minPriceCondition = (obj as any).price >= Number(minPrice);
  if (maxPrice != "")
    maxPriceCondition = (obj as any).price <= Number(maxPrice);
  return minPriceCondition && maxPriceCondition;
};

export const checkSellerRatingMatches = (filter, obj) => {
  const selectedSellerRatingCondition = filter.sellerRating?.length > 0;
  const sellerRatingMatches = selectedSellerRatingCondition
    ? filter.sellerRating.includes(
        parseInt((obj as any)?.userId.reviewMark).toString() + "*"
      )
    : true;
  return sellerRatingMatches;
};

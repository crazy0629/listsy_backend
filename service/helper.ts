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
  const earthRadiusMiles = 3958.8;

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

export const checkSellerTypeMatches = (filter, obj) => {
  const selectedSellerTypeCondition = filter.sellerType?.length > 0;
  let index = filter.sellerType.indexOf("Not Specified");
  if (index > -1) {
    filter.sellerType[index] = "";
  }
  const sellerTypeMatches = selectedSellerTypeCondition
    ? filter.sellerType.includes((obj as any)?.itemDetailInfo?.sellerType)
    : true;
  return sellerTypeMatches;
};

export const checkBrandMatches = (filter, obj) => {
  const selectedBrandCondition = filter.brand?.length > 0;
  let index = filter.brand.indexOf("Not Specified");
  if (index > -1) {
    filter.brand[index] = "";
  }
  const brandMatches = selectedBrandCondition
    ? filter.brand.includes((obj as any)?.itemDetailInfo?.brand)
    : true;
  return brandMatches;
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

export const checkItemConditionMatches = (filter, obj) => {
  const selectedItemCondition = filter.itemCondition?.length > 0;
  const itemConditionMatches = selectedItemCondition
    ? filter.itemCondition.includes((obj as any)?.itemDetailInfo?.itemCondition)
    : true;
  return itemConditionMatches;
};

export const getConditionToCountry = (data) => {
  let condition: any = {};
  // if (data.centerLocationSelected == true && data.SearchWithin != "") {
  //   condition.countryCode = data.selectedLocation.countryCode;
  // } else {
  if (data.countryCode != null) {
    condition.countryCode = data.countryCode;
  }
  // }
  if (data.itemCategory != "All" && data.itemCategory != "") {
    condition.itemCategory = data.itemCategory;
  }
  return condition;
};

export const locationFilterDistanceAds = (data, adsList) => {
  if (
    data.centerLocationSelected == true &&
    data.SearchWithin != "" &&
    data.SearchWithin != "Nationwide"
  ) {
    let distance = 0;
    if (data.SearchWithin != "Current location")
      distance = parseInt(data.SearchWithin.match(/\d+/)[0]);
    adsList = adsList.filter((item) => {
      return (
        calculateDistance(
          item.lat,
          item.lng,
          data.selectedLocation.lat,
          data.selectedLocation.lng
        ) <= distance
      );
    });
  }
  return adsList;
};

export const sellerRatingFilterAds = (data, adsList) => {
  if (data.sellerRating && data.sellerRating?.length) {
    adsList = adsList.filter(
      (item: any) =>
        data.sellerRating.indexOf(
          Math.floor(item.userId.reviewMark).toString() + "*"
        ) !== -1
    );
  }
  return adsList;
};

export const priceFilterAds = (data, adsList) => {
  if (data.minPrice && data.minPrice != "") {
    adsList = adsList.filter(
      (item: any) => Number(data.minPrice) <= item.price
    );
  }
  if (data.maxPrice && data.maxPrice != "") {
    adsList = adsList.filter(
      (item: any) => Number(data.maxPrice) >= item.price
    );
  }
  return adsList;
};

export const itemConditionFilterAds = (data, adsList) => {
  if (data.itemCondition && data.itemCondition?.length) {
    adsList = adsList.filter(
      (item: any) =>
        data.itemCondition.indexOf(item.itemDetailInfo.itemCondition) !== -1
    );
  }
  return adsList;
};

export const sellerTypeFilterAds = (data, adsList) => {
  if (data.sellerType && data.sellerType?.length) {
    let index = data.sellerType.indexOf("Not Specified");
    data.sellerType[index] = "";
    adsList = adsList.filter(
      (item: any) =>
        data.sellerType.indexOf(item.itemDetailInfo.sellerType) !== -1
    );
  }
  return adsList;
};

export const genderFilterAds = (data, adsList) => {
  if (data.gender && data.gender?.length) {
    let index = data.gender.indexOf("Not Specified");
    data.gender[index] = "";
    adsList = adsList.filter(
      (item: any) => data.gender.indexOf(item.itemDetailInfo.gender) !== -1
    );
  }
  return adsList;
};

export const skinFilterAds = (data, adsList) => {
  if (data.skin && data.skin?.length) {
    let index = data.skin.indexOf("Not Specified");
    data.skin[index] = "";
    adsList = adsList.filter(
      (item: any) => data.skin.indexOf(item.itemDetailInfo.skinHairType) !== -1
    );
  }
  return adsList;
};

export const ingredientsFilterAds = (data, adsList) => {
  if (data.ingredients && data.ingredients?.length) {
    let index = data.ingredients.indexOf("Not Specified");
    data.ingredients[index] = "";
    adsList = adsList.filter(
      (item: any) =>
        data.ingredients.indexOf(item.itemDetailInfo.ingredients) !== -1
    );
  }
  return adsList;
};

export const sizeFilterAds = (data, adsList) => {
  if (data.size && data.size?.length) {
    let index = data.size.indexOf("Not Specified");
    data.size[index] = "";
    adsList = adsList.filter(
      (item: any) => data.size.indexOf(item.itemDetailInfo.sizeVolume) !== -1
    );
  }
  return adsList;
};

export const certificationsFilterAds = (data, adsList) => {
  if (data.certifications && data.certifications?.length) {
    let index = data.certifications.indexOf("Not Specified");
    data.certifications[index] = "";
    adsList = adsList.filter(
      (item: any) =>
        data.certifications.indexOf(item.itemDetailInfo.certifications) !== -1
    );
  }
  return adsList;
};

export const brandFilterAds = (data, adsList) => {
  if (data.brand && data.brand?.length) {
    let index = data.brand.indexOf("Not Specified");
    data.brand[index] = "";
    adsList = adsList.filter(
      (item: any) => data.brand.indexOf(item.itemDetailInfo.brand) !== -1
    );
  }
  return adsList;
};

export const itemBrandFilterAds = (data, adsList) => {
  if (data.itemBrand && data.itemBrand?.length) {
    let index = data.itemBrand.indexOf("Not Specified");
    data.itemBrand[index] = "";
    adsList = adsList.filter(
      (item: any) => data.itemBrand.indexOf(item.itemDetailInfo.brand) !== -1
    );
  }
  return adsList;
};

export const itemAgeFilterAds = (data, adsList) => {
  if (data.itemAge && data.itemAge?.length) {
    let index = data.itemAge.indexOf("Not Specified");
    data.itemAge[index] = "";
    adsList = adsList.filter(
      (item: any) => data.itemAge.indexOf(item.itemDetailInfo.itemAge) !== -1
    );
  }
  return adsList;
};

export const itemGenderFilterAds = (data, adsList) => {
  if (data.itemGender && data.itemGender?.length) {
    let index = data.itemGender.indexOf("Not Specified");
    data.itemGender[index] = "";
    adsList = adsList.filter(
      (item: any) => data.itemGender.indexOf(item.itemDetailInfo.gender) !== -1
    );
  }
  return adsList;
};

export const itemEducationFilterAds = (data, adsList) => {
  if (data.itemEducation && data.itemEducation?.length) {
    let index = data.itemEducation.indexOf("Not Specified");
    data.itemEducation[index] = "";
    adsList = adsList.filter(
      (item: any) =>
        data.itemEducation.indexOf(item.itemDetailInfo.education) !== -1
    );
  }
  return adsList;
};

export const itemAgeGroupFilterAds = (data, adsList) => {
  if (data.itemAge && data.itemAge?.length) {
    adsList = adsList.filter((item: any) => {
      const set = new Set(data.itemAge);
      for (let element of item.itemDetailInfo.ageGroup) {
        if (set.has(element)) {
          return true;
        }
      }
      return false;
    });
  }
  return adsList;
};

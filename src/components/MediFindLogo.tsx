import React from "react";
import { View, Image, ImageStyle, StyleProp, ViewStyle } from "react-native";
import Svg, { Rect, Path, Circle } from "react-native-svg";

interface MediFindLogoProps {
  size?: number;
  useImage?: boolean;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
}

export const MediFindLogoSvg: React.FC<{ size?: number }> = ({ size = 64 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect width="100" height="100" rx="24" fill="#0F766E" />
      <Path
        d="M50 25V75M25 50H75"
        stroke="white"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <Circle
        cx="50"
        cy="50"
        r="15"
        fill="none"
        stroke="#14B8A6"
        strokeWidth="4"
        strokeDasharray="10 5"
      />
    </Svg>
  );
};

export const MediFindLogo: React.FC<MediFindLogoProps> = ({
  size = 64,
  useImage = true,
  style,
  imageStyle,
}) => {
  if (!useImage) {
    return (
      <View style={style}>
        <MediFindLogoSvg size={size} />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={require("../../assets/logo.png")}
        style={[
          { width: size, height: size, resizeMode: "contain" },
          imageStyle,
        ]}
      />
    </View>
  );
};

export default MediFindLogo;

import {mapping} from "@eva-design/eva";

export const customMapping = {
  ...mapping,
  components: {
    ...mapping.components,
    Text: {
      meta: {
        scope: "all",
      },
      appearances: {
        default: {
          mapping: {
            fontFamily: "MontserratRegular", // Correct property
          },
        },
      },
    },
    Button: {
      meta: {
        scope: "all",
      },
      appearances: {
        filled: {
          mapping: {
            borderRadius: 10, // Corrected to camelCase
            paddingVertical: 12,
            paddingHorizontal: 24,
            textFontFamily: "MontserratRegular", // Correct key for text font
            textTransform: "uppercase",
          },
        },
      },
    },
    Input: {
      meta: {
        scope: "all",
      },
      appearances: {
        default: {
          mapping: {
            borderRadius: 10,
            textFontFamily: "MontserratRegular",
          },
        },
      },
    },
    Card: {
      meta: {
        scope: "all",
      },
      appearances: {
        default: {
          mapping: {
            borderRadius: 16,
            paddingVertical: 20,
            paddingHorizontal: 20,
            backgroundColor: "#FFFFFF", // Correct property name
          },
        },
      },
    },
  },
};

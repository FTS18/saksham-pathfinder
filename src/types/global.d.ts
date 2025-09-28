declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (options: any, elementId: string): any;
          InlineLayout: {
            SIMPLE: string;
          };
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
}

export {};
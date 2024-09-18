declare namespace kintone {
  const $PLUGIN_ID: string;

  namespace app {
    function getId(): number;
    namespace record {
      function get(): Promise<{ record: Record<string, any>; }>;
      function set(data: { record: Record<string, any>; }): Promise<void>;
      function setFieldShown(fieldCode: string, isVisible: boolean): void;
      function getSpaceElement(elementID: string): HTMLElement;
    }
    function getHeaderMenuSpaceElement(): HTMLElement;
  }

  namespace events {
    function on(event: string | string[], handler: (event: any) => any): void;
  }

  namespace plugin {
    namespace app {
      function getConfig(pluginId: string): Record<string, any>;
    }
  }

  function api(url: string, method: "GET" | "POST" | "PUT", body: any, success: (response: any) => void, failure: (error: any) => void): void;
}

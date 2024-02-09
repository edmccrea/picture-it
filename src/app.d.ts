declare global {
  namespace App {
    type Style =
      | "2d-cartoon"
      | "lego"
      | "pixar"
      | "anime"
      | "monster"
      | "comic-book-villain"
      | "comic-book-hero"
      | "abstract"
      | "watercolor"
      | "oil-painting";

    type ToastType = "info" | "warn" | "error" | "success";

    interface ToastMessage {
      type: ToastType;
      heading: string;
      message: string;
    }
  }
}

export {};

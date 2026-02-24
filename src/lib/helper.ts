export const goToDocumentation = () => {
   window.open("/docs", "_blank");
};

export const getPlaceHolderImage = (name: string, style: string = "notionists-neutral") => {
   return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(name)}&scale=90`;
}
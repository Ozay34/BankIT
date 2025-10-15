import mime from "mime-types"
import CSVExtractor from "./CSVExtractor.jsx";

export const ExtractorComponents = {
    "csv": {
        accept: ["text/csv", "text/plain"],
        serialize(file, callback){
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = (e) => {
                callback(e.target.result)
            }
        },
        component: () => CSVExtractor
    }
}

export const supportedMIMETypes = Object.values(ExtractorComponents).map((extractor) => extractor.accept).flat();
export const supportedFileTypes = supportedMIMETypes.map((type) => "." + mime.extension(type))
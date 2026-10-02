import { KeywordFormItem } from "@amitkk/seo/types/keyword";

interface KeywordListProps {
  keywords?: KeywordFormItem[];
  showPrimaryLabel?: boolean;
}

const KeywordList: React.FC<KeywordListProps> = ({
  keywords = [],
  showPrimaryLabel = true,
}) => {
  if (!keywords.length) {
    return (
      <p className="text-sm text-muted-foreground">No keywords</p>
    );
  }

  return (
    <div className="my-4 space-y-2">
      <h3 className="text-base font-bold">Keywords</h3>

      <div className="flex flex-wrap gap-2">
        {keywords.map((item) => (
          <span key={item._id?.toString()} className={`rounded-full px-3 py-1 text-xs border ${item.primary ? "bg-primary text-white border-primary" : "bg-transparent text-foreground border-gray-300"}`}>
            {item.keyword}
          </span>
        ))}
      </div>
    </div>
  );
};

export default KeywordList;
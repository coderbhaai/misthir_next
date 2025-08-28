export type MetaTableProps = {
  meta_id?: String;
  title?: String;
  description?: String;
}

const MetaTableInput: React.FC<MetaTableProps> = ({ title, description }) => {
  return (
    <>
      Title : {title} - {title?.length}<br/>
      Description : {description} - {description?.length}
    </>
  );
};

export default MetaTableInput;
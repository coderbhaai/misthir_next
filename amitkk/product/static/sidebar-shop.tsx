import { FilterTree } from "@amitkk/product/static/FilterTree";
import { useMemo } from "react";
import { TextField } from "@amitkk/components/basic/TextField";

interface Props {
  category?: any[];
  tag?: any[];
  productTypes?: any[];
  productBrand?: any[];
  ingridient?: any[];
  flavors?: any[];
  colors?: any[];
  eggless?: any[];
  glutten?: any[];
  sugar?: any[];
  storage?: any[];
  tax?: any[];
  selected: Record<string, string[]>;
  onChange: (payload: {
    key: string;
    values: string[];
    lastSelected?: string;
    parentPath?: string[];
  }) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

const buildTree = (flat: any[]) => {
  const map = new Map<string, any>();

  flat.forEach((item) => {
    map.set(String(item._id), {
      _id: String(item._id),
      name: item.name,
      parent_id: item.parent_id ? String(item.parent_id) : null,
      children: [],
    });
  });

  const tree: any[] = [];

  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id).children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

// Helper to convert flat list to item format required by FilterTree
const mapToTreeItems = (list: any[]) => 
  (list || []).map((item) => ({ _id: String(item._id), name: item.name, children: [] }));

export function SidebarShop({ 
  category = [], 
  tag = [], 
  productTypes = [], 
  productBrand = [], 
  ingridient = [], 
  flavors = [], 
  colors = [], 
  eggless = [], 
  glutten = [], 
  sugar = [], 
  storage = [], 
  selected, 
  onChange, 
  search, 
  onSearchChange 
}: Props) {
  // Trees or flat options
  const categoryTreeData = useMemo(() => buildTree(category || []), [category]);
  const typeTreeData = useMemo(() => buildTree(productTypes || []), [productTypes]);
  
  const brandOptions = useMemo(() => mapToTreeItems(productBrand), [productBrand]);
  const tagOptions = useMemo(() => mapToTreeItems(tag), [tag]);
  const ingredientOptions = useMemo(() => mapToTreeItems(ingridient), [ingridient]);
  const flavorOptions = useMemo(() => mapToTreeItems(flavors), [flavors]);
  const colorOptions = useMemo(() => mapToTreeItems(colors), [colors]);
  const egglessOptions = useMemo(() => mapToTreeItems(eggless), [eggless]);
  const glutenOptions = useMemo(() => mapToTreeItems(glutten), [glutten]);
  const sugarOptions = useMemo(() => mapToTreeItems(sugar), [sugar]);
  const storageOptions = useMemo(() => mapToTreeItems(storage), [storage]);

  const stockOptions = useMemo(() => [
    { _id: "true", name: "In Stock", children: [] },
  ], []);

  return (
    <div className="col-span-12 md:col-span-3">
      <div className="sticky top-20">
        <div className="shadow-lg rounded-xl p-3 md:p-5 max-h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar" style={{ background: "#dfdfdf" }}>
          <TextField placeholder="Search Products..." value={search} onChange={(e) => onSearchChange(e.target.value)}/>
          
          <FilterTree label="Availability" items={stockOptions} selected={selected.in_stock ?? []} onChange={(vals, last) => { onChange({ key: "in_stock", values: vals, lastSelected: last }); }} className="mobile"/>
          
          {categoryTreeData.length > 0 && (
            <FilterTree label="Categories" items={categoryTreeData} selected={selected.category ?? []} onChange={(vals, last) => { onChange({ key: "category", values: vals, lastSelected: last }); }}/>
          )}

          {typeTreeData.length > 0 && (
            <FilterTree label="Types" items={typeTreeData} selected={selected.type ?? []} onChange={(vals, last) => { onChange({ key: "type", values: vals, lastSelected: last }); }}/>
          )}

          {brandOptions.length > 0 && (
            <FilterTree label="Brands" items={brandOptions} selected={selected.brand ?? []} onChange={(vals, last) => { onChange({ key: "brand", values: vals, lastSelected: last }); }}/>
          )}

          {tagOptions.length > 0 && (
            <FilterTree label="Tags" items={tagOptions} selected={selected.tag ?? []} onChange={(vals, last) => { onChange({ key: "tag", values: vals, lastSelected: last }); }}/>
          )}

          {ingredientOptions.length > 0 && (
            <FilterTree label="Ingredients" items={ingredientOptions} selected={selected.ingridient ?? []} onChange={(vals, last) => { onChange({ key: "ingridient", values: vals, lastSelected: last }); }}/>
          )}

          {flavorOptions.length > 0 && (
            <FilterTree label="Flavors" items={flavorOptions} selected={selected.flavors ?? []} onChange={(vals, last) => { onChange({ key: "flavors", values: vals, lastSelected: last }); }}/>
          )}

          {colorOptions.length > 0 && (
            <FilterTree label="Colors" items={colorOptions} selected={selected.colors ?? []} onChange={(vals, last) => { onChange({ key: "colors", values: vals, lastSelected: last }); }}/>
          )}

          {egglessOptions.length > 0 && (
            <FilterTree label="Eggless" items={egglessOptions} selected={selected.eggless ?? []} onChange={(vals, last) => { onChange({ key: "eggless", values: vals, lastSelected: last }); }}/>
          )}

          {glutenOptions.length > 0 && (
            <FilterTree label="Gluten Free" items={glutenOptions} selected={selected.glutten ?? []} onChange={(vals, last) => { onChange({ key: "glutten", values: vals, lastSelected: last }); }}/>
          )}

          {sugarOptions.length > 0 && (
            <FilterTree label="Sugar Free" items={sugarOptions} selected={selected.sugar ?? []} onChange={(vals, last) => { onChange({ key: "sugar", values: vals, lastSelected: last }); }}/>
          )}

          {storageOptions.length > 0 && (
            <FilterTree label="Storage" items={storageOptions} selected={selected.storage ?? []} onChange={(vals, last) => { onChange({ key: "storage", values: vals, lastSelected: last }); }}/>
          )}
        </div>
      </div>
    </div>
  );
}
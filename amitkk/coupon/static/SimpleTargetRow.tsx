export const SimpleTargetRow = ({ item, typeLabel, selectedTargets, onToggle, onQuantityChange }: any) => {
    const itemId = item._id || item.id;
    const targetObj = selectedTargets.find((t: any) => t.id === itemId);
    const isSelected = !!targetObj;

    return (
        <tr className="hover:bg-gray-50 font-medium">
            <td className="p-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(itemId)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
            </td>
            <td className="p-3 text-gray-900">
                {item.name} <span className="text-xs text-gray-400 font-normal">({typeLabel})</span>
            </td>
            <td className="p-3">
                {isSelected && (
                    <input 
                        type="number"
                        min="1"
                        value={targetObj?.quantity ?? 1}
                        onChange={(e) => onQuantityChange(itemId, parseInt(e.target.value) || 1)}
                        className="w-16 px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-primary"
                    />
                )}
            </td>
            <td className="p-3 text-xs text-gray-500">N/A</td>
        </tr>
    );
};
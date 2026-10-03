export const SimpleTargetRow = ({ item, typeLabel, selectedTargets, setSelectedTargets }: any) => {
    const itemId = item._id || item.id;
    const isSelected = selectedTargets.includes(itemId);

    return (
        <tr className="hover:bg-gray-50 font-medium">
            <td className="p-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {
                        setSelectedTargets((prev: string[]) => 
                            isSelected ? prev.filter(id => id !== itemId) : [...prev, itemId]
                        );
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
            </td>
            <td className="p-3 text-gray-900">
                {item.name} <span className="text-xs text-gray-400 font-normal">({typeLabel})</span>
            </td>
            <td className="p-3 text-xs text-gray-500">N/A</td>
        </tr>
    );
};
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import { AchievementProps } from '@amitkk/basic/types';
import ModuleLink from '@amitkk/basic/static/ModuleLink';
import { Iconify } from '@amitkk/basic/utils/my-utils/admin-utils';
import type { MediaProps } from '@amitkk/basic/types/media';
import { Button } from "@amitkk/components/button/button";
import StatusSwitch from '@amitkk/components/admin/status-switch';
import MediaImage from '@amitkk/components/admin/table-image';

interface AchievementItem {
  _id: string;
  name: string;
  value: number;
  displayOrder: number | null;
  status: boolean;
  createdAt: Date;
  media_id?: MediaProps | null;
}

export interface GroupedAchievement {
  module: string;
  module_id: string;
  module_name?: string;
  module_url?: string;
  achievements: AchievementItem[];
}

export interface DataProps extends AchievementProps {
};

type Props = {
  row: GroupedAchievement;
  onEdit: (row: GroupedAchievement) => void;
};

export function AdminDataTable({ row, onEdit }: Props) {
  return (
      <TableRow>
        <TableCell>{row.module}</TableCell>
        <TableCell><ModuleLink module={row.module} module_url={row.module_url} module_name={row.module_name}/></TableCell>
        <TableCell>
          <div className="space-y-4">
            {row.achievements.map((ach, index) => (
              <div key={ach._id} className="space-y-2">
                <p className="text-sm font-semibold">{ach.name} — {ach.value}</p>
                <div className="flex flex-wrap items-center gap-4">
                  {ach.media_id ? ( <MediaImage media={ach.media_id as MediaProps}/> ) : null}

                  <StatusSwitch id={ach._id.toString()} status={ach.status} modelName="Achievement"/>
                  {ach.displayOrder && ( <p className="text-sm text-muted-foreground">Order: {ach.displayOrder ?? "-"}</p> )}
                </div>
                {index < row.achievements.length - 1 && ( <div className="mt-4 border-t"/> )}
              </div>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(row)}>
            <Iconify icon="Edit" />
          </Button>
        </TableCell>


      </TableRow>
  );
}

import Loading from "@amitkk/basic/static/Loading";
import { TableCell, TableRow } from '@amitkk/components/basic/table';
import React from "react";

const TableLoader: React.FC = () => {
    return (
    <TableRow>
        <TableCell colSpan={5} align="center"><Loading/></TableCell>
    </TableRow>
    )

}

export default TableLoader;
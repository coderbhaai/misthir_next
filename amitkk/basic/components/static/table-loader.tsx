import { TableCell, TableRow, Typography } from "@mui/material";
import React from "react";


const TableLoader: React.FC = () => {
    return (
    <TableRow>
        <TableCell colSpan={5} align="center">
        <Typography component="span">Loading...</Typography>
        </TableCell>
    </TableRow>
    )

}

export default TableLoader;
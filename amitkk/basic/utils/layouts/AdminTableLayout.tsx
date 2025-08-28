"use client";

import { ReactNode } from "react";
import { Box, Button, Table, TableBody, TableContainer, TablePagination, Typography } from "@mui/material";
import { Scrollbar, TableToolbar, TableEmptyRows, TableNoData, UseTableReturnType } from "@amitkk/basic/utils/AdminUtils";
import { Iconify } from "@amitkk/basic/utils/utils";

type AdminTableLayoutProps<T> = {
  title: ReactNode;
  filterData: string;
  onFilterData: (value: string) => void;
  onAddNew?: () => void;
  addButtonLabel?: string;
  table: UseTableReturnType; // your `useTable()` return type
  data: T[];
  dataFiltered?: T[];
  head: ReactNode; // AdminTableHead
  rows: ReactNode; // Mapped <AdminDataTable /> rows
  emptyMessageField?: keyof T; // Which field to search
  children?: ReactNode; // Optional slot for extra content
};

export function AdminTableLayout<T>({
  title,
  filterData,
  onFilterData,
  onAddNew,
  addButtonLabel = "New Item",
  table,
  data,
  dataFiltered,
  head,
  rows,
  emptyMessageField,
  children,
}: AdminTableLayoutProps<T>) {

    const filtered = dataFiltered ?? data;
  return (
    <>
      <Box display="flex" alignItems="center">
        <Typography variant="h4" flexGrow={1}>{title}</Typography>
        {onAddNew && (
          <Button onClick={onAddNew} variant="contained" color="inherit" startIcon={<Iconify icon="Add" />}>{addButtonLabel}</Button>
        )}
      </Box>
      
      <TableToolbar
        numSelected={table.selected.length}
        filterData={filterData}
        onFilterData={(e) => {
          onFilterData(e.target.value);
          table.onResetPage();
        }}
      />
      
      <Scrollbar>
        <TableContainer sx={{ overflow: "unset" }}>
          <Table>
            {head}
            <TableBody>
              {rows}
              <TableEmptyRows height={68} emptyRows={table.emptyRows(dataFiltered?.length ?? 0)}/>
              {!data.length && !!filterData && (
                <TableNoData searchQuery={filterData} />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
      
      <TablePagination component="div" page={table.page} count={data.length} rowsPerPage={table.rowsPerPage} onPageChange={table.onChangePage} rowsPerPageOptions={[5, 10, 25]} onRowsPerPageChange={table.onChangeRowsPerPage} />
      {children}
    </>
  );
}
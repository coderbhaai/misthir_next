"use client";

import {useState, useCallback} from 'react';
import { forwardRef } from "react";
import SimpleBar, { Props as SimpleBarProps } from "simplebar-react";
import Box, { BoxProps } from "@mui/material/Box";
import type { TableRowProps } from '@mui/material/TableRow';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { SxProps, Theme } from '@mui/material/styles';
import Checkbox from '@mui/material/Checkbox';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import Tooltip from "@mui/material/Tooltip";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import type { ChangeEvent } from "react";
import { Iconify } from '@amitkk/basic/utils/utils';

export const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)'
} as const;

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0;
}

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator<T>(order: 'asc' | 'desc', orderBy: keyof T): (a: T, b: T) => number {
  return (a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    let comparison = 0;

    if (aValue > bValue) {
      comparison = 1;
    } else if (aValue < bValue) {
      comparison = -1;
    }

    return order === 'asc' ? comparison : -comparison;
  };
}


// Utility to compute empty rows for pagination
function getEmptyRows(page: number, rowsPerPage: number, totalRows: number) {
  return Math.max(0, (1 + page) * rowsPerPage - totalRows);
}

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: string[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  return {
    page,
    order,
    orderBy,
    rowsPerPage,
    selected,

    // Handlers
    onSort,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,

    // Derived helpers
    emptyRows: (totalRows: number) => getEmptyRows(page, rowsPerPage, totalRows),
  };
}

// Type for consumers
export type UseTableReturnType = ReturnType<typeof useTable>;


export function applyFilter<T>({inputData, comparator, filterData, filterFields = []}: {inputData: T[]; filterData: string; comparator: (a: T, b: T) => number; filterFields: Array<keyof T>}): T[] {
  if (!Array.isArray(inputData)) {
    return [];
  }
  
  const stabilizedThis = inputData?.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis?.map(el => el[0]);

  if (filterData && filterFields.length > 0) {
    inputData = inputData.filter(item =>
      filterFields.some(field => {
        const value = item[field];
        return (
          (typeof value === 'string' && value.toLowerCase().includes(filterData.toLowerCase())) ||
          (typeof value === 'number' && value.toString().includes(filterData)) ||
          (typeof value === 'boolean' && (filterData.toLowerCase() === 'true' ? value : !value))
        );
      })
    );
  }
  return inputData;
}

export interface ScrollbarProps extends SimpleBarProps {
  slotProps?: {
    wrapper?: React.CSSProperties;
    contentWrapper?: React.CSSProperties;
    content?: React.CSSProperties;
  };
  fillContent?: boolean;
  sx?: BoxProps["sx"];
}

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(
  ({ slotProps, children, fillContent, sx, ...other }, ref) => {
    return (
      <Box
        className={"mnl__scrollbar__root"}
        sx={{
          minWidth: 0,
          minHeight: 0,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          "& .simplebar-wrapper": slotProps?.wrapper,
          "& .simplebar-content-wrapper": slotProps?.contentWrapper,
          "& .simplebar-content": {
            ...(fillContent && {
              minHeight: 1,
              display: "flex",
              flex: "1 1 auto",
              flexDirection: "column",
            }),
            ...slotProps?.content,
          },
          ...sx,
        }}
      >
        <SimpleBar
          scrollableNodeProps={{ ref }}
          clickOnTrack={false}
          {...other}
        >
          {children}
        </SimpleBar>
      </Box>
    );
  }
);

Scrollbar.displayName = "Scrollbar";


export type TableEmptyRowsProps = TableRowProps & {
  emptyRows: number;
  height?: number;
  sx?: SxProps<Theme>;
};

export function TableEmptyRows({ emptyRows, height, sx, ...other }: TableEmptyRowsProps) {
  if (!emptyRows) {
    return null;
  }

  return (
    <TableRow
      sx={{
        ...(height && {
          height: height * emptyRows,
        }),
        ...sx,
      }}
      {...other}
    >
      <TableCell colSpan={9} />
    </TableRow>
  );
}

export interface HeadCell {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right' | 'justify' | 'inherit';
  width?: number | string;
  minWidth?: number | string;
}

export interface AdminTableHeadProps {
  showCheckBox: boolean;
  orderBy: string;
  rowCount: number;
  numSelected: number;
  order: 'asc' | 'desc';
  onSort: (id: string) => void;
  headLabel: HeadCell[];
  onSelectAllRows: (checked: boolean) => void;
  sx?: SxProps<Theme>;
}

export function AdminTableHead({
  showCheckBox,
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onSort,
  onSelectAllRows,
  sx,
}: AdminTableHeadProps) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {showCheckBox && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                onSelectAllRows(event.target.checked)
              }
            />
          </TableCell>
        )}
        {headLabel?.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ width: headCell.width, minWidth: headCell.minWidth }}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export type TableToolbarProps = {
  numSelected: number;
  filterData: string;
  onFilterData: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function TableToolbar({ numSelected, filterData, onFilterData }: TableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: "flex",
        justifyContent: "space-between",
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: "primary.main",
          bgcolor: "primary.lighter",
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">{numSelected} Selected</Typography>
      ) : null }

      <OutlinedInput fullWidth value={filterData} onChange={onFilterData} placeholder="Search ..." startAdornment={ <InputAdornment position="start"><Iconify /></InputAdornment> } sx={{ maxWidth: 320 }}/>

      {numSelected > 0 ? (
        <Tooltip title="Delete"><IconButton><Iconify icon="Delete" /></IconButton></Tooltip>) 
        : (
        <Tooltip title="Filter list"><IconButton><Iconify icon="FilterList" /></IconButton></Tooltip>
      )}

    </Toolbar>
  );
}


export type TableNoDataProps = TableRowProps & {
  searchQuery: string;
};

export function TableNoData({ searchQuery, ...other }: TableNoDataProps) {
  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Not found
          </Typography>

          <Typography variant="body2">
            No results found for <strong>"{searchQuery}"</strong>.
            <br />
            Try checking for typos or using complete words.
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}


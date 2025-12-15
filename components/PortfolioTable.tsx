"use client";

import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
    flexRender,
    ColumnDef,
    GroupingState,
} from '@tanstack/react-table';
import { PortfolioItem } from '@/types';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
    data: PortfolioItem[];
    lastUpdated: string;
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(val);
};

const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(val);
};

export const PortfolioTable: React.FC<Props> = ({ data, lastUpdated }) => {
    const [grouping, setGrouping] = useState<GroupingState>(['sector']);
    const [expanded, setExpanded] = useState({});

    const columns = useMemo<ColumnDef<PortfolioItem>[]>(
        () => [
            {
                header: 'Sector',
                accessorKey: 'sector',
                cell: ({ row, getValue }) => {
                    if (row.getIsGrouped()) {
                        return (
                            <div className="flex items-center gap-2 font-medium text-foreground">
                                <button
                                    {...{
                                        onClick: row.getToggleExpandedHandler(),
                                        style: { cursor: 'pointer' },
                                    }}
                                    className="hover:bg-muted p-1 rounded transition-colors"
                                >
                                    {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {String(getValue())}
                                <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                                    Last Updated: {new Date(lastUpdated).toLocaleString()}
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">
                                    ({row.subRows.length})
                                </span>
                            </div>
                        );
                    }
                    return null;
                }
            },
            {
                header: 'Particulars',
                accessorKey: 'name',
                cell: info => <span className="font-medium text-foreground">{String(info.getValue())}</span>
            },
            {
                header: 'Symbol',
                accessorKey: 'symbol',
                cell: info => <span className="text-xs text-muted-foreground font-mono">{String(info.getValue())}</span>
            },
            {
                header: 'Buy Price',
                accessorKey: 'purchasePrice',
                cell: info => <span className="text-muted-foreground">{formatCurrency(Number(info.getValue()))}</span>
            },
            {
                header: 'Qty',
                accessorKey: 'quantity',
                cell: info => <span className="text-muted-foreground">{formatNumber(Number(info.getValue()))}</span>
            },
            {
                header: 'Investment',
                accessorKey: 'investment',
                aggregationFn: 'sum',
                cell: info => <span className="text-foreground">{formatCurrency(Number(info.getValue()))}</span>,
                aggregatedCell: ({ getValue }) => (
                    <div className="font-semibold text-foreground">
                        {formatCurrency(Number(getValue()))}
                    </div>
                )
            },
            {
                header: 'Weight',
                accessorKey: 'portfolioPercent',
                cell: info => <span className="text-muted-foreground text-xs">{Number(info.getValue()).toFixed(1)}%</span>
            },
            {
                header: 'CMP',
                accessorKey: 'cmp',
                cell: info => {
                    const val = Number(info.getValue());
                    return (
                        <div className={`font-mono ${val === 0 ? "text-yellow-500" : "text-blue-400"}`}>
                            {val === 0 ? "N/A" : formatCurrency(val)}
                        </div>
                    )
                }
            },
            {
                header: 'Present Value',
                accessorKey: 'presentValue',
                aggregationFn: 'sum',
                cell: info => <span className="text-foreground font-medium">{formatCurrency(Number(info.getValue()))}</span>,
                aggregatedCell: ({ getValue }) => (
                    <div className="font-bold text-blue-400">
                        {formatCurrency(Number(getValue()))}
                    </div>
                )
            },
            {
                header: 'Gain/Loss',
                accessorKey: 'gainLoss',
                aggregationFn: 'sum',
                cell: ({ getValue }) => {
                    const val = Number(getValue());
                    return (
                        <div className={cn("font-medium", val >= 0 ? "text-green-500" : "text-red-500")}>
                            {val >= 0 ? "+" : ""}{formatCurrency(val)}
                        </div>
                    )
                },
                aggregatedCell: ({ getValue }) => {
                    const val = Number(getValue());
                    return (
                        <div className={cn("font-bold", val >= 0 ? "text-green-500" : "text-red-500")}>
                            {val >= 0 ? "+" : ""}{formatCurrency(val)}
                        </div>
                    )
                }
            },
            {
                header: 'P/E',
                accessorKey: 'pe',
                cell: info => <span className="text-xs text-muted-foreground truncate max-w-[100px] block" title={String(info.getValue())}>{String(info.getValue())}</span>
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            grouping,
            expanded,
        },
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        getCoreRowModel: getCoreRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    return (
        <div className="w-full">
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted text-muted-foreground border-b border-border">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-3 font-medium whitespace-nowrap">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-border">
                            {table.getRowModel().rows.map(row => (
                                <tr
                                    key={row.id}
                                    className={cn(
                                        "transition-colors hover:bg-muted/50",
                                        row.getIsGrouped() ? "bg-muted/30" : "bg-card"
                                    )}
                                >
                                    {row.getVisibleCells().map(cell => {
                                        if (row.getIsGrouped()) {
                                            const isGroupColumn = cell.column.id === 'sector';
                                            const isAggregated = cell.getIsAggregated();

                                            if (isGroupColumn) {
                                                return (
                                                    <td key={cell.id} colSpan={1} className="px-6 py-3 whitespace-nowrap">
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                );
                                            }

                                            if (isAggregated) {
                                                return (
                                                    <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
                                                        {flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                );
                                            }

                                            return <td key={cell.id} className="px-6 py-3"></td>;
                                        }

                                        return (
                                            <td key={cell.id} className="px-6 py-3 whitespace-nowrap">
                                                {cell.column.id === 'sector' ? null : flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

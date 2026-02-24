"use client";

import { useState } from "react";
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { CloudDownload } from "lucide-react";
import { format } from "date-fns";

export interface ExcelColumn {
    header: string;
    key: string;
    width?: number;
    type?: 'text' | 'currency' | 'date' | 'boolean' | 'number';
}

interface ExcelExportButtonProps {
    data: any[];
    columns: ExcelColumn[];
    filename?: string;
    sheetName?: string;
    label?: string;
    className?: string;
}

export function ExcelExportButton({
    data,
    columns,
    filename = "Export",
    sheetName = "Sheet1",
    label = "Export Excel",
    className
}: ExcelExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);

            // Set columns
            worksheet.columns = columns.map(col => ({
                header: col.header,
                key: col.key,
                width: col.width || 20,
            }));

            // Style Header Row
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // White text
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD44D80' } // Pink background
            };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

            // Add Data
            data.forEach((item) => {
                const rowData: Record<string, any> = {};

                columns.forEach(col => {
                    let val = item[col.key];
                    if (col.type === 'boolean') {
                        val = val ? 'Yes' : 'No';
                    } else if (col.type === 'date' && val) {
                        try {
                            val = format(new Date(val), 'dd/MM/yyyy');
                        } catch (e) {
                            // ignore invalid date
                        }
                    }
                    rowData[col.key] = val;
                });

                const row = worksheet.addRow(rowData);

                // Apply cell styling based on column type
                row.eachCell((cell: ExcelJS.Cell, colNumber: number) => {
                    // Thin borders for all cells
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    };

                    // Format Currency
                    const colConfig = columns[colNumber - 1];
                    if (colConfig.type === 'currency') {
                        cell.numFmt = '"RM" #,##0.00';
                        cell.alignment = { horizontal: 'right' };
                    }
                    // Format Numbers
                    else if (colConfig.type === 'number') {
                        cell.numFmt = '#,##0';
                        cell.alignment = { horizontal: 'right' };
                    }
                });
            });

            // Ensure header row borders are also set since eachCell above is per data row
            headerRow.eachCell((cell: ExcelJS.Cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Save file
            const dateStr = new Date().toISOString().split('T')[0];
            const finalFilename = `${filename}_${dateStr}.xlsx`;

            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, finalFilename);

        } catch (error) {
            console.error("Error exporting Excel file:", error);
            alert("Failed to export Excel file. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting || !data || data.length === 0}
            className={className || "flex items-center justify-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-semibold text-sai-charcoal hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"}
        >
            <CloudDownload className="w-4 h-4 text-sai-gray" />
            {isExporting ? "Exporting..." : label}
        </button>
    );
}

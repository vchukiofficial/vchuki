"use client"

import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

// Rajasthani Theme Colors
const THEME = {
  headerBg: "C4956A",      // Heritage Gold / Rajasthani Sand
  headerFont: "FFFFFF",     // White text on header
  headerBorder: "8B5E3C",  // Darker Rajasthani brown
  titleBg: "2A1F14",       // Deep Rajasthani brown
  titleFont: "F5E6D3",     // Cream
  accentBg: "F5E6D3",      // Light cream for alternating rows
  borderColor: "D4A574",   // Warm sand border
}

interface ExportOptions {
  title: string
  sheetName: string
  columns: { header: string; key: string; width?: number }[]
  data: Record<string, any>[]
  filename: string
}

export async function exportToExcel({ title, sheetName, columns, data, filename }: ExportOptions) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = "VCHUKI Admin"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(sheetName)

  // Row 1: Brand Title
  worksheet.mergeCells(1, 1, 1, columns.length)
  const titleCell = worksheet.getCell("A1")
  titleCell.value = "VCHUKI — Premium Linen Menswear"
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: THEME.titleFont } }
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.titleBg } }
  titleCell.alignment = { horizontal: "center", vertical: "middle" }
  worksheet.getRow(1).height = 30

  // Row 2: Report Title
  worksheet.mergeCells(2, 1, 2, columns.length)
  const reportCell = worksheet.getCell("A2")
  reportCell.value = `${title} — Exported ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
  reportCell.font = { name: "Arial", size: 10, italic: true, color: { argb: "5C3D2E" } }
  reportCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.accentBg } }
  reportCell.alignment = { horizontal: "center", vertical: "middle" }
  worksheet.getRow(2).height = 22

  // Row 3: Empty spacer
  worksheet.getRow(3).height = 8

  // Row 4: Headers with Rajasthani theme
  const headerRow = worksheet.getRow(4)
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = col.header
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: THEME.headerFont } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: THEME.headerBg } }
    cell.alignment = { horizontal: "center", vertical: "middle" }
    cell.border = {
      top: { style: "thin", color: { argb: THEME.headerBorder } },
      bottom: { style: "thin", color: { argb: THEME.headerBorder } },
      left: { style: "thin", color: { argb: THEME.headerBorder } },
      right: { style: "thin", color: { argb: THEME.headerBorder } },
    }
  })
  headerRow.height = 24

  // Data rows
  data.forEach((row, rowIdx) => {
    const excelRow = worksheet.getRow(5 + rowIdx)
    columns.forEach((col, colIdx) => {
      const cell = excelRow.getCell(colIdx + 1)
      cell.value = row[col.key] ?? ""
      cell.font = { name: "Arial", size: 9 }
      cell.alignment = { vertical: "middle", horizontal: "left" }
      cell.border = {
        bottom: { style: "thin", color: { argb: THEME.borderColor } },
      }
    })
    // Alternating row colors
    if (rowIdx % 2 === 0) {
      columns.forEach((_, colIdx) => {
        excelRow.getCell(colIdx + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FDF8F3" } }
      })
    }
  })

  // Auto-fit columns
  columns.forEach((col, i) => {
    const colObj = worksheet.getColumn(i + 1)
    let maxLen = col.header.length
    data.forEach(row => {
      const val = String(row[col.key] ?? "")
      if (val.length > maxLen) maxLen = val.length
    })
    colObj.width = Math.min(Math.max(col.width || maxLen + 4, 12), 50)
  })

  // Footer row
  const footerRowIdx = 5 + data.length + 1
  worksheet.mergeCells(footerRowIdx, 1, footerRowIdx, columns.length)
  const footerCell = worksheet.getCell(`A${footerRowIdx}`)
  footerCell.value = "© VCHUKI | vchuki.com | support@vchuki.com"
  footerCell.font = { name: "Arial", size: 8, italic: true, color: { argb: "8B5E3C" } }
  footerCell.alignment = { horizontal: "center" }

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  saveAs(blob, `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`)
}

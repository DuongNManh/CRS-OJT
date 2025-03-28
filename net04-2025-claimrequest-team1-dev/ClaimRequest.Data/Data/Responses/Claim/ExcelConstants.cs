using ClaimRequest.DAL.Data.Responses.Claim;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace ClaimRequest.DAL.Data.Responses.Claim;

public class ExcelConstants : IExcelConstants
{        
    public readonly string[] HEADERS = new[]
    {
        "No.",
        "ID Claim",
        "Claim Name",
        "Claim Type",
        "Description",
        "Project Name",
        "Amount",
        "Working Hours",
        "Paid Date", 
    };
    
    public byte[] GenerateClaimExport(IEnumerable<ClaimExportDto> exportModels)
    {
        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        
        using var package = new ExcelPackage();
        var worksheet = package.Workbook.Worksheets.Add("Claims Export");

        // Add headers
        for (int i = 0; i < HEADERS.Length; i++)
        {
            worksheet.Cells[1, i + 1].Value = HEADERS[i];
            worksheet.Cells[1, i + 1].Style.Font.Bold = true;
        }

        // Add data
        int row = 2;
        foreach (var claim in exportModels)
        {
            try 
            {
                worksheet.Cells[row, 1].Value = claim.RowNumber;
                worksheet.Cells[row, 2].Value = claim.ClaimId;
                worksheet.Cells[row, 3].Value = claim.ClaimName;
                worksheet.Cells[row, 4].Value = claim.ClaimType;
                worksheet.Cells[row, 5].Value = claim.ClaimDescription;
                worksheet.Cells[row, 6].Value = claim.ProjectName;
                worksheet.Cells[row, 7].Value = claim.Amount;
                worksheet.Cells[row, 8].Value = claim.TotalWorkingHours;
                worksheet.Cells[row, 9].Value = claim.PaidDate;

                // Format cells
                worksheet.Cells[row, 7].Style.Numberformat.Format = "#,##0";
                if (claim.PaidDate.HasValue)
                {
                    worksheet.Cells[row, 9].Style.Numberformat.Format = "dd/MM/yyyy";
                }

                row++;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing row {row}: {ex.Message}");
            }
        }

        // Auto fit columns
        worksheet.Cells.AutoFitColumns();

        // Add borders
        var dataRange = worksheet.Cells[1, 1, row - 1, HEADERS.Length];
        dataRange.Style.Border.Top.Style = ExcelBorderStyle.Thin;
        dataRange.Style.Border.Left.Style = ExcelBorderStyle.Thin;
        dataRange.Style.Border.Right.Style = ExcelBorderStyle.Thin;
        dataRange.Style.Border.Bottom.Style = ExcelBorderStyle.Thin;

        return package.GetAsByteArray();

    }
}
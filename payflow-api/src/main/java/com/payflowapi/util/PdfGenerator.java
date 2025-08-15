package com.payflowapi.util;

import com.payflowapi.entity.Payslip;
import java.io.ByteArrayOutputStream;

public class PdfGenerator {

    public static void generatePayslipPDF(Payslip payslip, ByteArrayOutputStream outputStream) {
        // Minimal PDF content
        System.out.println("Download endpoint called");
        String content = "Payslip for Employee ID: " + payslip.getEmployeeId()
                + "\nMonth: " + payslip.getMonth()
                + "\nYear: " + payslip.getYear()
                + "\nNet Pay: " + payslip.getNetPay();

        try {
            outputStream.write(content.getBytes());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


// package com.payflowapi.util;

// import com.payflowapi.entity.Payslip;
// import com.itextpdf.text.Document;
// import com.itextpdf.text.DocumentException;
// import com.itextpdf.text.Paragraph;
// import com.itextpdf.text.pdf.PdfWriter;

// import java.io.ByteArrayOutputStream;

// public class PdfGenerator {

//     public static void generatePayslipPDF(Payslip payslip, ByteArrayOutputStream outputStream) {
//         Document document = new Document();
//         try {
//             PdfWriter.getInstance(document, outputStream);
//             document.open();

//             document.add(new Paragraph("PaySlip"));
//             document.add(new Paragraph("Employee Name: " + payslip.getEmployeeName()));
//             document.add(new Paragraph("Employee ID: " + payslip.getEmployeeId()));
//             document.add(new Paragraph("Month: " + payslip.getMonth() + " " + payslip.getYear()));
//             document.add(new Paragraph("Gross Salary: ₹" + payslip.getGrossSalary()));
//             document.add(new Paragraph("Net Salary: ₹" + payslip.getNetPay()));

//             // Add more fields as needed

//         } catch (DocumentException e) {
//             e.printStackTrace();
//         } finally {
//             document.close();
//         }
//     }
// }

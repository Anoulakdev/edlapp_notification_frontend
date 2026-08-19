import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";
import { PaymentItem } from "@/schemas/payment";

const styles = StyleSheet.create({
  page: {
    fontFamily: "phetsarathOT",
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    fontSize: 6.5,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },

  topAccentBar: {
    height: 2.5,
    backgroundColor: "#1d4ed8",
    marginBottom: 6,
    borderRadius: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
  },
  headerLeft: {
    flex: 1.3,
  },
  reportMainTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  reportSubTitle: {
    fontSize: 6.5,
    color: "#64748b",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  metaBadgeContainer: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  metaItemText: {
    fontSize: 6,
    color: "#475569",
    marginBottom: 1,
    textAlign: "right",
  },
  metaItemTextBold: {
    fontWeight: "bold",
    color: "#0f172a",
  },

  // 3 Top Stats Cards
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 3,
    paddingVertical: 4.5,
    paddingHorizontal: 7,
    borderLeftWidth: 3,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  statLabel: {
    fontSize: 5.5,
    color: "#64748b",
    marginBottom: 1.5,
  },
  statValue: {
    fontSize: 8.5,
    fontWeight: "bold",
  },

  // Table styling
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#1e3a8a",
    borderBottomWidth: 0.5,
    borderBottomColor: "#172554",
    alignItems: "center",
    minHeight: 20,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 6.2,
    fontWeight: "bold",
    paddingVertical: 3,
    paddingHorizontal: 2.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    minHeight: 18,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
  },
  tableRowTotal: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    borderTopWidth: 1,
    borderTopColor: "#10b981",
    minHeight: 20,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 5.8,
    paddingVertical: 2.5,
    paddingHorizontal: 2.5,
    color: "#1e293b",
  },
  tableCellBold: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
  textMuted: {
    color: "#64748b",
  },
  subText: {
    fontSize: 5.2,
    color: "#64748b",
    marginTop: 0.5,
  },
  codeCell: {
    fontSize: 5.2,
    color: "#334155",
    lineHeight: 1.25,
  },
  codeLabel: {
    color: "#64748b",
    fontWeight: "bold",
  },
  providerBadge: {
    backgroundColor: "#eff6ff",
    borderWidth: 0.5,
    borderColor: "#bfdbfe",
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 3,
    alignSelf: "center",
  },
  providerBadgeText: {
    fontSize: 5.6,
    fontWeight: "bold",
    color: "#1d4ed8",
    textAlign: "center",
  },
  monthBadge: {
    backgroundColor: "#f5f3ff",
    borderWidth: 0.5,
    borderColor: "#ddd6fe",
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 3,
    alignSelf: "center",
  },
  monthBadgeText: {
    fontSize: 5.5,
    fontWeight: "bold",
    color: "#6d28d9",
    textAlign: "center",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 8,
    left: 16,
    right: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 5.5,
    color: "#94a3b8",
  },
});

interface PaymentReportPDFProps {
  data: PaymentItem[];
  startDate?: string;
  endDate?: string;
  accountNo?: string;
  totalAmount?: number;
}

export function PaymentReportPDF({
  data = [],
  startDate,
  endDate,
  accountNo,
  totalAmount,
}: PaymentReportPDFProps) {
  const generatedAt = moment().format("DD/MM/YYYY HH:mm:ss");

  const totalPaid =
    totalAmount ??
    data.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);

  const formatMoney = (val: number | string | null | undefined) => {
    if (val === null || val === undefined || val === "") return "0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(num) ? "0" : num.toLocaleString("en-US");
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "-";
    const m = moment(dateStr);
    return m.isValid() ? m.format("DD/MM/YYYY HH:mm:ss") : dateStr;
  };

  return (
    <Document title={`Payment_Report_${moment().format("YYYYMMDD_HHmmss")}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>

        {/* Top Blue Accent Bar */}
        <View style={styles.topAccentBar} />

        {/* Report Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.reportMainTitle}>
              ລາຍງານການຊຳລະເງິນຄ່າກະແສໄຟຟ້າຜ່ານ EDLAPP
            </Text>
            <Text style={styles.reportSubTitle}>
              ລະບົບ EDL APP - Payment Transactions Report
            </Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.metaBadgeContainer}>
              <Text style={styles.metaItemText}>
                ວັນທີ & ເວລາອອກລາຍງານ: <Text style={styles.metaItemTextBold}>{generatedAt}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Summary Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: "#2563eb" }]}>
            <Text style={styles.statLabel}>ຈຳນວນທຸລະກຳທັງໝົດ</Text>
            <Text style={[styles.statValue, { color: "#1d4ed8" }]}>
              {data.length.toLocaleString()} ລາຍການ
            </Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: "#059669" }]}>
            <Text style={styles.statLabel}>ຍອດເງິນຊຳລະລວມທັງໝົດ</Text>
            <Text style={[styles.statValue, { color: "#047857" }]}>
              {formatMoney(totalPaid)} ກີບ
            </Text>
          </View>
        </View>

        {/* Table of Transactions */}
        <View style={styles.table}>
          {/* Table Header (repeats on every page if multi-page) */}
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "3%" }]}>
              #
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "11%" }]}>
              ວັນທີ
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>
              ເລກບັນຊີ
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "12%" }]}>
              ຊື່ເຈົ້າຂອງບັນຊີ
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "12%" }]}>
              ຜູ້ຊຳລະ / ເບີໂທ
            </Text>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "6%" }]}>
              ບິນເດືອນ
            </Text>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "6.5%" }]}>
              ຊ່ອງທາງ
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "14%" }]}>
              Tx ID / Bill ID
            </Text>
            <Text style={[styles.tableHeaderCell, { width: "13.5%" }]}>
              Bank Tx / Ticket
            </Text>
            <Text style={[styles.tableHeaderCell, styles.textRight, { width: "13%" }]}>
              ຍອດຊຳລະ (ກີບ)
            </Text>
          </View>

          {/* Table Rows */}
          {data.length === 0 ? (
            <View style={[styles.tableRow, styles.tableRowEven]}>
              <Text
                style={[
                  styles.tableCell,
                  styles.textCenter,
                  { width: "100%", paddingVertical: 14, color: "#94a3b8" },
                ]}
              >
                ບໍ່ມີຂໍ້ມູນລາຍການຊຳລະເງິນໃນຊ່ວງເວລານີ້
              </Text>
            </View>
          ) : (
            data.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <View
                  key={item.payment_id || item.transaction_id || index}
                  style={[
                    styles.tableRow,
                    isEven ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                  wrap={false}
                >
                  {/* 1. Index */}
                  <Text
                    style={[
                      styles.tableCell,
                      styles.textCenter,
                      styles.textMuted,
                      { width: "3%" },
                    ]}
                  >
                    {index + 1}
                  </Text>

                  {/* 2. Paid Date */}
                  <Text style={[styles.tableCell, { width: "11%" }]}>
                    {item.paid_at || formatDate(item.created_at)}
                  </Text>

                  {/* 3. Account No */}
                  <Text
                    style={[
                      styles.tableCell,
                      styles.tableCellBold,
                      { width: "9%" },
                    ]}
                  >
                    {item.account_no || "-"}
                  </Text>

                  {/* 4. Account Name */}
                  <Text style={[styles.tableCell, { width: "12%" }]}>
                    {item.account_name || "-"}
                  </Text>

                  {/* 5. Customer Paid & Phone */}
                  <View style={[styles.tableCell, { width: "12%" }]}>
                    <Text style={{ fontSize: 5.8, color: "#0f172a" }}>
                      {item.customer_paid || "-"}
                    </Text>
                    {item.customer_phone ? (
                      <Text style={styles.subText}>{item.customer_phone}</Text>
                    ) : null}
                  </View>

                  {/* 6. Bill Month */}
                  <View style={[styles.tableCell, { width: "6%" }]}>
                    {item.bill_month ? (
                      <View style={styles.monthBadge}>
                        <Text style={styles.monthBadgeText}>{item.bill_month}</Text>
                      </View>
                    ) : (
                      <Text style={[styles.textCenter, styles.textMuted, { fontSize: 5.8 }]}>-</Text>
                    )}
                  </View>

                  {/* 7. Provider Code */}
                  <View style={[styles.tableCell, { width: "6.5%" }]}>
                    <View style={styles.providerBadge}>
                      <Text style={styles.providerBadgeText}>
                        {item.provider_code || "BCEL"}
                      </Text>
                    </View>
                  </View>

                  {/* 8. EDL Transaction ID & Bill ID */}
                  <View style={[styles.tableCell, { width: "14%" }]}>
                    <Text style={styles.codeCell}>
                      <Text style={styles.codeLabel}>Tx: </Text>
                      {item.transaction_id || "-"}
                    </Text>
                    <Text style={styles.codeCell}>
                      <Text style={styles.codeLabel}>Bill: </Text>
                      {item.bill_id ? String(item.bill_id) : "-"}
                    </Text>
                  </View>

                  {/* 9. Bank Transaction ID & Ticket */}
                  <View style={[styles.tableCell, { width: "13.5%" }]}>
                    <Text style={styles.codeCell}>
                      <Text style={styles.codeLabel}>Tx: </Text>
                      {item.bank_transaction_id ? String(item.bank_transaction_id) : "-"}
                    </Text>
                    <Text style={styles.codeCell}>
                      <Text style={styles.codeLabel}>Tk: </Text>
                      {item.bank_ticket || item.bank_fccref || "-"}
                    </Text>
                  </View>

                  {/* 10. Paid Amount */}
                  <Text
                    style={[
                      styles.tableCell,
                      styles.textRight,
                      { width: "13%", fontWeight: "bold", color: "#047857", fontSize: 6.5 },
                    ]}
                  >
                    {formatMoney(item.paid_amount)}
                  </Text>
                </View>
              );
            })
          )}

          {/* Table Grand Total Summary Row */}
          {data.length > 0 && (
            <View style={styles.tableRowTotal} wrap={false}>
              <Text
                style={[
                  styles.tableCell,
                  styles.textCenter,
                  { width: "3%" },
                ]}
              >
                {""}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { width: "84%", fontWeight: "bold", color: "#065f46", fontSize: 6.5 },
                ]}
              >
                ຍອດລວມທັງໝົດ ({data.length.toLocaleString()} ລາຍການ)
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.textRight,
                  { width: "13%", fontWeight: "bold", color: "#047857", fontSize: 7.0 },
                ]}
              >
                {formatMoney(totalPaid)}
              </Text>
            </View>
          )}
        </View>

        {/* Footer with Page Numbering */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            ລັດວິສາຫະກິດໄຟຟ້າລາວ (EDL)
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `ໜ້າທີ ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    fontFamily: "phetsarathOT",
    paddingTop: 18,
    paddingBottom: 26,
    paddingHorizontal: 16,
    fontSize: 7,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  accentBar: {
    height: 2,
    backgroundColor: "#2563eb",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  headerLeft: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  metaText: {
    fontSize: 7,
    color: "#64748b",
    marginBottom: 1.5,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    marginBottom: 8,
  },
  table: {
    width: "100%",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    borderBottomWidth: 0.5,
    borderBottomColor: "#1d4ed8",
    alignItems: "center",
    minHeight: 18,
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontSize: 6.5,
    fontWeight: "bold",
    padding: 2.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    minHeight: 14,
    alignItems: "flex-start",
  },
  tableRowEven: {
    backgroundColor: "#ffffff",
  },
  tableRowOdd: {
    backgroundColor: "#f8fafc",
  },
  tableCell: {
    fontSize: 6,
    padding: 2.5,
    color: "#334155",
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#cbd5e1",
    paddingTop: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 6,
    color: "#94a3b8",
  },
});

export interface RatingDataItem {
  id: number;
  createdAt: string;
  rating: number;
  comment?: string | null;
  agentId?: number;
  topic?: {
    id?: number;
    name?: string;
  } | null;
  agent?: {
    id?: number;
    username?: string;
    employee?: {
      id?: number;
      first_name?: string;
      last_name?: string;
    } | null;
  } | null;
  externalUser?: {
    id?: number;
    name?: string;
    customerName?: string;
    phone?: string;
    msisdn?: string;
  } | null;
}

export interface RatingCountItem {
  agentId: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  totalRatings: number;
  averageRating: number | string;
  agent?: {
    id?: number;
    username?: string;
    employee?: {
      id?: number;
      first_name?: string;
      last_name?: string;
      emp_code?: string;
    } | null;
  } | null;
}

interface RatingReportPDFProps {
  data: RatingDataItem[];
  countData: RatingCountItem[];
  startDate: string;
  endDate: string;
}

export const RatingReportPDF: React.FC<RatingReportPDFProps> = ({
  data,
  countData,
  startDate,
  endDate,
}) => {
  const printedAt = moment().format("DD/MM/YYYY HH:mm:ss");

  return (
    <Document title="ລາຍງານການປະເມີນຄວາມພໍໃຈ">
      {/* SECTION 1: Rating Details */}
      {data.length > 0 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.accentBar} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.reportTitle}>ລາຍງານລາຍລະອຽດການປະເມິນຄວາມພໍໃຈ</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.metaText}>
                ຊ່ວງວັນທີ: {moment(startDate).format("DD/MM/YYYY")} – {moment(endDate).format("DD/MM/YYYY")}
              </Text>
              <Text style={styles.metaText}>ພິມວັນທີ: {printedAt}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.table}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "5%" }]}>ລຳດັບ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "12%" }]}>ວັນທີປະເມີນ</Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>ຜູ້ປະເມີນ</Text>
              <Text style={[styles.tableHeaderCell, { width: "18%" }]}>ພະນັກງານ</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>ຫົວຂໍ້</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>ຄະແນນ</Text>
              <Text style={[styles.tableHeaderCell, { width: "24%" }]}>ຄຳຄິດເຫັນ</Text>
            </View>

            {data.map((item, index) => {
              const dateStr = item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY HH:mm") : "-";
              const agentStr =
                `${item.agent?.employee?.first_name || ""} ${item.agent?.employee?.last_name || ""}`.trim() ||
                `Agent #${item.agentId || "-"}`;
              const customerStr = item.externalUser?.customerName || item.externalUser?.name || "ບໍ່ລະບຸຊື່";
              const phoneStr = item.externalUser?.msisdn || item.externalUser?.phone || "";
              const topicStr = item.topic?.name || "-";
              const ratingStr = `${item.rating} ດາວ`;
              const commentStr = item.comment || "-";

              const isEven = index % 2 === 0;

              return (
                <View
                  key={item.id || index}
                  style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.textCenter, { width: "5%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "12%" }]}>
                    {dateStr}
                  </Text>
                  <Text style={[styles.tableCell, { width: "18%" }]}>
                    {customerStr} {phoneStr ? `\n(${phoneStr})` : ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "18%" }]}>{agentStr}</Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>{topicStr}</Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                    {ratingStr}
                  </Text>
                  <Text style={[styles.tableCell, { width: "24%" }]}>{commentStr}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>ລາຍງານການປະເມີນຄວາມພໍໃຈ (ລາຍລະອຽດ)</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) =>
                `ໜ້າ ${pageNumber} / ${totalPages}   |   ${printedAt}`
              }
            />
          </View>
        </Page>
      )}

      {/* SECTION 2: Rating Summary per Employee */}
      {countData.length > 0 && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.accentBar} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.reportTitle}>ລາຍງານສະຫຼຸບຈຳນວນດາວຕາມພະນັກງານ</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.metaText}>
                ຊ່ວງວັນທີ: {moment(startDate).format("DD/MM/YYYY")} – {moment(endDate).format("DD/MM/YYYY")}
              </Text>
              <Text style={styles.metaText}>ພິມວັນທີ: {printedAt}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.table}>
            <View style={styles.tableHeaderRow} fixed>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "5%" }]}>ລຳດັບ</Text>
              <Text style={[styles.tableHeaderCell, { width: "31%" }]}>ຊື່ພະນັກງານ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>1 ດາວ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>2 ດາວ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>3 ດາວ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>4 ດາວ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>5 ດາວ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "12%" }]}>ລວມທັງໝົດ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "12%" }]}>ຄະແນນສະເລ່ຍ</Text>
            </View>

            {countData.map((item, index) => {
              const agentStr =
                `${item.agent?.employee?.first_name || ""} ${item.agent?.employee?.last_name || ""}`.trim() ||
                `Agent #${item.agentId}`;
              const empCode = item.agent?.employee?.emp_code
                ? ` (${item.agent.employee.emp_code})`
                : "";

              const isEven = index % 2 === 0;

              return (
                <View
                  key={item.agentId || index}
                  style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.textCenter, { width: "5%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, { width: "31%" }]}>
                    {`${agentStr}${empCode}`}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                    {item.rating1}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                    {item.rating2}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                    {item.rating3}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                    {item.rating4}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                    {item.rating5}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "12%" }]}>
                    {item.totalRatings}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "12%" }]}>
                    {item.averageRating}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>ລາຍງານການປະເມີນຄວາມພໍໃຈ (ສະຫຼຸບຈຳນວນດາວ)</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) =>
                `ໜ້າ ${pageNumber} / ${totalPages}   |   ${printedAt}`
              }
            />
          </View>
        </Page>
      )}
    </Document>
  );
};

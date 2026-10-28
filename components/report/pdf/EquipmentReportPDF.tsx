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

export interface EquipmentDataItem {
  id: number;
  amount: number;
  comment?: string | null;
  equipmentId: number;
  equipmentName: string;
  unit: string;
  equipmentBranch?: string;
  problemAssignId?: number;
  voltage?: string;
  typeRepair?: string;
  activeAt?: string | null;
  activeTime?: number;
  technician?: string;
  problemId?: number | null;
  problemtype?: string;
  customerName?: string;
  customerTel?: string;
  province?: string;
  district?: string;
  village?: string;
  branch?: string;
  repairDistrict?: string;
  problemStatus?: string;
  createdAt?: string | null;
}

export interface EquipmentCountItem {
  equipmentId: number;
  equipmentName: string;
  unit: string;
  branchId?: number | null;
  branchName?: string;
  totalAmount: number;
  timesUsed: number;
}

interface EquipmentReportPDFProps {
  data: EquipmentDataItem[];
  countData: EquipmentCountItem[];
  activeTab?: "data" | "count";
  startDate: string;
  endDate: string;
}

export const EquipmentReportPDF: React.FC<EquipmentReportPDFProps> = ({
  data,
  countData,
  activeTab,
  startDate,
  endDate,
}) => {
  const printedAt = moment().format("DD/MM/YYYY HH:mm:ss");

  const showData = Boolean(data && data.length > 0);
  const showCount = Boolean(countData && countData.length > 0);

  return (
    <Document title="ລາຍງານອຸປະກອນ">
      {/* SECTION: Detailed Equipment Usage (Tab 1) */}
      {showData && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.accentBar} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.reportTitle}>ລາຍງານລາຍລະອຽດການໃຊ້ອຸປະກອນ</Text>
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
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "3.5%" }]}>#</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "9.5%" }]}>ວັນທີ</Text>
              <Text style={[styles.tableHeaderCell, { width: "15%" }]}>ຊື່ອຸປະກອນ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "7%" }]}>ຈຳນວນ</Text>
              <Text style={[styles.tableHeaderCell, { width: "13%" }]}>ຜູ້ແຈ້ງ</Text>
              <Text style={[styles.tableHeaderCell, { width: "11%" }]}>ປະເພດບັນຫາ</Text>
              <Text style={[styles.tableHeaderCell, { width: "11%" }]}>ສາຂາ / ສູນເມືອງ</Text>
              <Text style={[styles.tableHeaderCell, { width: "12%" }]}>ສະຖານທີ່</Text>
              <Text style={[styles.tableHeaderCell, { width: "10%" }]}>ປະເພດສ້ອມແປງ / ແຮງດັນ</Text>
              <Text style={[styles.tableHeaderCell, { width: "8%" }]}>ໝາຍເຫດ</Text>
            </View>

            {data.map((item, index) => {
              const dateStr = item.createdAt
                ? moment(item.createdAt).format("DD/MM/YYYY HH:mm")
                : "-";

              const isEven = index % 2 === 0;

              return (
                <View
                  key={item.id || index}
                  style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.textCenter, { width: "3.5%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "9.5%" }]}>
                    {dateStr}
                  </Text>
                  <Text style={[styles.tableCell, { width: "15%" }]}>
                    {item.equipmentName || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "7%" }]}>
                    {item.amount} {item.unit || ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "13%" }]}>
                    {item.customerName || "-"}
                    {item.customerTel ? `\n(ໂທ: ${item.customerTel})` : ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "11%" }]}>
                    {item.problemtype || "-"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "11%" }]}>
                    {item.branch || "-"}
                    {item.repairDistrict ? `\n${item.repairDistrict}` : ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "12%" }]}>
                    {[item.village, item.district].filter(Boolean).join(", ") || "-"}
                    {item.province ? `\nແຂວງ ${item.province}` : ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "10%" }]}>
                    {item.typeRepair || "-"}
                    {item.voltage ? `\n${item.voltage}` : ""}
                  </Text>
                  <Text style={[styles.tableCell, { width: "8%" }]}>
                    {item.comment || "-"}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>ລາຍງານອຸປະກອນ (ລາຍລະອຽດການໃຊ້ອຸປະກອນ)</Text>
            <Text
              style={styles.footerText}
              render={({ pageNumber, totalPages }) =>
                `ໜ້າ ${pageNumber} / ${totalPages}   |   ${printedAt}`
              }
            />
          </View>
        </Page>
      )}

      {/* SECTION: Equipment Usage Summary (Tab 2) */}
      {showCount && (
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.accentBar} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.reportTitle}>ລາຍງານສະຫຼຸບຈຳນວນຕາມອຸປະກອນ</Text>
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
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "5%" }]}>#</Text>
              <Text style={[styles.tableHeaderCell, { width: "35%" }]}>ຊື່ອຸປະກອນ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "12%" }]}>ຫົວໜ່ວຍ</Text>
              <Text style={[styles.tableHeaderCell, { width: "24%" }]}>ສາຂາ</Text>
              <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "12%" }]}>ຈຳນວນຄັ້ງທີ່ໃຊ້</Text>
              <Text style={[styles.tableHeaderCell, styles.textRight, { width: "12%" }]}>ຈຳນວນນຳໃຊ້ລວມ</Text>
            </View>

            {countData.map((item, index) => {
              const isEven = index % 2 === 0;

              return (
                <View
                  key={item.equipmentId || index}
                  style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
                  wrap={false}
                >
                  <Text style={[styles.tableCell, styles.textCenter, { width: "5%" }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, { width: "35%" }]}>
                    {item.equipmentName || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "12%" }]}>
                    {item.unit || "-"}
                  </Text>
                  <Text style={[styles.tableCell, { width: "24%" }]}>
                    {item.branchName || "-"}
                  </Text>
                  <Text style={[styles.tableCell, styles.textCenter, { width: "12%" }]}>
                    {Number(item.timesUsed || 0).toLocaleString()} ຄັ້ງ
                  </Text>
                  <Text style={[styles.tableCell, styles.textRight, { width: "12%" }]}>
                    {Number(item.totalAmount || 0).toLocaleString()} {item.unit || ""}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>ລາຍງານອຸປະກອນ (ສະຫຼຸບຈຳນວນຕາມອຸປະກອນ)</Text>
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


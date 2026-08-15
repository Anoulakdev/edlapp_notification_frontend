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
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 3,
    padding: 5,
    borderLeftWidth: 2.5,
  },
  statLabel: {
    fontSize: 6,
    color: "#64748b",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 8,
    fontWeight: "bold",
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

export interface ProblemReportItem {
  id: number;
  fullName: string;
  tel: string;
  description?: string | null;
  createdAt: string;
  villageId?: number;
  problemtype?: {
    id?: number;
    name?: string;
  } | null;
  problemstatus?: {
    id?: number;
    callcenter?: string;
    edlapp?: string;
  } | null;
  sourcetype?: {
    id?: number;
    name?: string;
  } | null;
  province?: {
    id?: number;
    province_name?: string;
  } | null;
  district?: {
    id?: number;
    district_name?: string;
  } | null;
  village?: {
    id?: number;
    village_name?: string;
  } | null;
  branch?: {
    id?: number;
    name?: string;
  } | null;
  repairDistrict?: {
    id?: number;
    name?: string;
  } | null;
  totalTime?: number | null;
}

interface ProblemReportPDFProps {
  data: ProblemReportItem[];
  startDate: string;
  endDate: string;
  provinceName?: string;
  districtName?: string;
  villageName?: string;
}

export const ProblemReportPDF: React.FC<ProblemReportPDFProps> = ({
  data,
  startDate,
  endDate,
  provinceName = "ທຸກແຂວງ",
  districtName = "ທຸກເມືອງ",
  villageName = "ທຸກບ້ານ",
}) => {
  const printedAt = moment().format("DD/MM/YYYY HH:mm:ss");
  const uniqueVillages = new Set(data.map((d) => d.villageId).filter(Boolean)).size;

  let totalUseTimeMinutes = 0;
  data.forEach((doc) => {
    if (doc.totalTime) {
      totalUseTimeMinutes += Number(doc.totalTime);
    }
  });
  const hours = Math.floor(totalUseTimeMinutes / 60);
  const mins = totalUseTimeMinutes % 60;
  const formattedDuration =
    hours > 0
      ? `${hours} ຊົ່ວໂມງ ${mins} ນາທີ (${totalUseTimeMinutes.toLocaleString()} ນາທີ)`
      : `${mins} ນາທີ`;

  return (
    <Document title="ລາຍງານການແຈ້ງບັນຫາ">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Accent Bar */}
        <View style={styles.accentBar} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.reportTitle}>ລາຍງານການແຈ້ງບັນຫາ</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.metaText}>
              ຊ່ວງວັນທີ: {moment(startDate).format("DD/MM/YYYY")} – {moment(endDate).format("DD/MM/YYYY")}
            </Text>
            <Text style={styles.metaText}>
              ແຂວງ: {provinceName}   ເມືອງ: {districtName}   ບ້ານ: {villageName}
            </Text>
            <Text style={styles.metaText}>ພິມວັນທີ: {printedAt}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          {/* Card 1: Total Docs */}
          <View style={[styles.statCard, { borderLeftColor: "#2563eb" }]}>
            <Text style={styles.statLabel}>ເອກະສານແຈ້ງບັນຫາທັງໝົດ</Text>
            <Text style={[styles.statValue, { color: "#2563eb" }]}>
              {data.length.toLocaleString()} ລາຍການ
            </Text>
          </View>

          {/* Card 2: Total Duration / useTime */}
          <View style={[styles.statCard, { borderLeftColor: "#d97706" }]}>
            <Text style={styles.statLabel}>ເວລາທີ່ໃຊ້ລວມ</Text>
            <Text style={[styles.statValue, { color: "#d97706" }]}>
              {formattedDuration}
            </Text>
          </View>

          {/* Card 3: Villages Count */}
          <View style={[styles.statCard, { borderLeftColor: "#7c3aed" }]}>
            <Text style={styles.statLabel}>ບ້ານທີ່ມີການແຈ້ງບັນຫາ</Text>
            <Text style={[styles.statValue, { color: "#7c3aed" }]}>
              {uniqueVillages.toLocaleString()} ບ້ານ
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "4%" }]}>ລຳດັບ</Text>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "8%" }]}>ວັນທີແຈ້ງ</Text>
            <Text style={[styles.tableHeaderCell, { width: "12%" }]}>ຊື່ ແລະ ນາມສະກຸນ</Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>ເບີໂທ</Text>
            <Text style={[styles.tableHeaderCell, { width: "11%" }]}>ປະເພດບັນຫາ</Text>
            <Text style={[styles.tableHeaderCell, { width: "8%" }]}>ຊ່ອງທາງ</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%" }]}>ສະຖານະ</Text>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "7%" }]}>ເວລາທີ່ໃຊ້</Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>ແຂວງ</Text>
            <Text style={[styles.tableHeaderCell, { width: "9%" }]}>ເມືອງ</Text>
            <Text style={[styles.tableHeaderCell, { width: "13%" }]}>ບ້ານ</Text>
          </View>

          {/* Rows */}
          {data.map((item, index) => {
            const isEven = index % 2 === 0;
            const timeStr =
              item.totalTime !== null && item.totalTime !== undefined && Number(item.totalTime) > 0
                ? `${item.totalTime} ນາທີ`
                : "-";

            return (
              <View
                key={item.id || index}
                style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
                wrap={false}
              >
                <Text style={[styles.tableCell, styles.textCenter, { width: "4%" }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCell, styles.textCenter, { width: "8%" }]}>
                  {item.createdAt ? moment(item.createdAt).format("DD/MM/YYYY") : "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "12%" }]}>{item.fullName || "-"}</Text>
                <Text style={[styles.tableCell, { width: "9%" }]}>{item.tel || "-"}</Text>
                <Text style={[styles.tableCell, { width: "11%" }]}>
                  {item.problemtype?.name || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "8%" }]}>
                  {item.sourcetype?.name || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  {item.problemstatus?.callcenter || "-"}
                </Text>
                <Text style={[styles.tableCell, styles.textCenter, { width: "7%" }]}>{timeStr}</Text>
                <Text style={[styles.tableCell, { width: "9%" }]}>
                  {item.province?.province_name || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "9%" }]}>
                  {item.district?.district_name || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "13%" }]}>
                  {item.village?.village_name || "-"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ລາຍງານການແຈ້ງບັນຫາ</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `ໜ້າ ${pageNumber} / ${totalPages}   |   ${printedAt}`
            }
          />
        </View>
      </Page>
    </Document>
  );
};

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

export interface CutpowerAddress {
  id?: number;
  villageId: number;
  userCount?: number | null;
  village?: {
    id?: number;
    village_name?: string;
  } | null;
}

export interface CutpowerDocReportItem {
  id: number;
  title: string;
  description?: string | null;
  cutpowerDate: string;
  startTime?: string | null;
  endTime?: string | null;
  useTime?: number | null;
  province?: {
    id?: number;
    province_name?: string;
  } | null;
  district?: {
    id?: number;
    district_name?: string;
  } | null;
  cutpowerAddresses?: CutpowerAddress[];
}

interface CutpowerReportPDFProps {
  data: CutpowerDocReportItem[];
  startDate: string;
  endDate: string;
  provinceName?: string;
  districtName?: string;
}

export const CutpowerReportPDF: React.FC<CutpowerReportPDFProps> = ({
  data,
  startDate,
  endDate,
  provinceName = "ທຸກແຂວງ",
  districtName = "ທຸກເມືອງ",
}) => {
  const printedAt = moment().format("DD/MM/YYYY HH:mm:ss");

  let sumVillages = 0;
  let sumUsers = 0;
  data.forEach((d) => {
    if (d.cutpowerAddresses) {
      sumVillages += d.cutpowerAddresses.length;
      d.cutpowerAddresses.forEach((a) => {
        sumUsers += Number(a.userCount) || 0;
      });
    }
  });

  return (
    <Document title="ລາຍງານແຈ້ງການຕັດໄຟ">
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Accent Bar */}
        <View style={styles.accentBar} />

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.reportTitle}>ລາຍງານແຈ້ງການຕັດໄຟ</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.metaText}>
              ຊ່ວງວັນທີ: {moment(startDate).format("DD/MM/YYYY")} – {moment(endDate).format("DD/MM/YYYY")}
            </Text>
            <Text style={styles.metaText}>
              ແຂວງ: {provinceName}   ເມືອງ: {districtName}
            </Text>
            <Text style={styles.metaText}>ພິມວັນທີ: {printedAt}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: "#2563eb" }]}>
            <Text style={styles.statLabel}>ເອກະສານທັງໝົດ</Text>
            <Text style={[styles.statValue, { color: "#2563eb" }]}>
              {data.length.toLocaleString()} ລາຍການ
            </Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#7c3aed" }]}>
            <Text style={styles.statLabel}>ບ້ານທີ່ແຈ້ງການຕັດໄຟທັງໝົດ</Text>
            <Text style={[styles.statValue, { color: "#7c3aed" }]}>
              {sumVillages.toLocaleString()} ບ້ານ
            </Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: "#059669" }]}>
            <Text style={styles.statLabel}>ຜູ້ໃຊ້ໄຟທີ່ໄດ້ຮັບການແຈ້ງເຕືອນທັງໝົດ</Text>
            <Text style={[styles.statValue, { color: "#059669" }]}>
              {sumUsers.toLocaleString()} ທ່ານ
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeaderRow} fixed>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "4%" }]}>ລຳດັບ</Text>
            <Text style={[styles.tableHeaderCell, { width: "16%" }]}>ຫົວຂໍ້</Text>
            <Text style={[styles.tableHeaderCell, { width: "16%" }]}>ລາຍລະອຽດ</Text>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "10%" }]}>ວັນທີຕັດໄຟ</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%" }]}>ແຂວງ</Text>
            <Text style={[styles.tableHeaderCell, { width: "10%" }]}>ເມືອງ</Text>
            <Text style={[styles.tableHeaderCell, { width: "25%" }]}>ບ້ານທີ່ແຈ້ງການຕັດໄຟ</Text>
            <Text style={[styles.tableHeaderCell, styles.textCenter, { width: "9%" }]}>ຜູ້ໃຊ້ໄຟ(ທ່ານ)</Text>
          </View>

          {/* Rows */}
          {data.map((item, index) => {
            const villagesWithUsers =
              item.cutpowerAddresses
                ?.map(
                  (a) =>
                    `${a.village?.village_name || `Village #${a.villageId}`}${a.userCount ? ` (${a.userCount})` : ""}`
                )
                .join(", ") || "-";

            const rowUsers =
              item.cutpowerAddresses?.reduce((acc, a) => acc + (Number(a.userCount) || 0), 0) || 0;

            const isEven = index % 2 === 0;

            return (
              <View
                key={item.id || index}
                style={[styles.tableRow, isEven ? styles.tableRowEven : styles.tableRowOdd]}
                wrap={false}
              >
                <Text style={[styles.tableCell, styles.textCenter, { width: "4%" }]}>
                  {index + 1}
                </Text>
                <Text style={[styles.tableCell, { width: "16%" }]}>{item.title || "-"}</Text>
                <Text style={[styles.tableCell, { width: "16%" }]}>{item.description || "-"}</Text>
                <Text style={[styles.tableCell, styles.textCenter, { width: "10%" }]}>
                  {item.cutpowerDate ? moment(item.cutpowerDate).format("DD/MM/YYYY") : "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  {item.province?.province_name || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "10%" }]}>
                  {item.district?.district_name || "-"}
                </Text>
                <Text style={[styles.tableCell, { width: "25%" }]}>{villagesWithUsers}</Text>
                <Text style={[styles.tableCell, styles.textCenter, { width: "9%" }]}>
                  {rowUsers > 0 ? rowUsers.toLocaleString() : "-"}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ລາຍງານແຈ້ງການຕັດໄຟ</Text>
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

import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import moment from "moment";
import { RegisterMeter } from "@/schemas/registermeter";

const styles = StyleSheet.create({
  page: {
    fontFamily: "phetsarathOT",
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 30,
    fontSize: 8.5,
    color: "#0f172a",
    backgroundColor: "#ffffff",
    lineHeight: 1.45,
  },
  // Top Accent Stripe
  accentBar: {
    height: 3,
    backgroundColor: "#1d4ed8",
    borderRadius: 2,
    marginBottom: 8,
  },
  // National Header
  nationalHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  nationalTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#0f172a",
    letterSpacing: 0.3,
  },
  nationalMotto: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 1,
  },
  nationalLine: {
    fontSize: 7,
    color: "#94a3b8",
    marginTop: 0.5,
  },
  // Brand & Meta Row
  orgHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: "#e2e8f0",
  },
  orgTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  orgSubtitle: {
    fontSize: 8,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: 1,
  },
  metaCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 0.8,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "flex-end",
  },
  metaIdRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaIdLabel: {
    fontSize: 7.5,
    color: "#64748b",
  },
  metaIdValue: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#1d4ed8",
  },
  metaDate: {
    fontSize: 7,
    color: "#64748b",
    marginTop: 1,
  },
  statusPill: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    fontSize: 7,
    fontWeight: "bold",
  },
  // Hero Title Banner
  titleBanner: {
    backgroundColor: "#1e3a8a",
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  bannerMainText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  bannerSubText: {
    color: "#93c5fd",
    fontSize: 7.5,
    marginTop: 1.5,
  },
  // Modern Card Panel
  card: {
    marginBottom: 8,
    borderWidth: 0.8,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  cardHeader: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 0.8,
    borderLeftWidth: 3.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
  },
  cardHeaderBadge: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: "bold",
  },
  cardBody: {
    padding: 7,
  },
  // Key Value Grid
  gridRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  gridRowLast: {
    flexDirection: "row",
    marginBottom: 0,
  },
  fieldCol2: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 6,
  },
  fieldCol3: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 4,
  },
  fieldLabel: {
    fontSize: 8,
    color: "#64748b",
    width: 98,
    lineHeight: 1.4,
  },
  fieldLabelShort: {
    fontSize: 8,
    color: "#64748b",
    width: 72,
    lineHeight: 1.4,
  },
  fieldLabelMini: {
    fontSize: 8,
    color: "#64748b",
    width: 42,
    lineHeight: 1.4,
  },
  fieldValue: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0f172a",
    flex: 1,
    lineHeight: 1.4,
  },
  // Section 3: Workflow Grid (Optimized column widths & labels for Lao phrases)
  workflowColMain: {
    flex: 1.55,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 8,
  },
  workflowColDate: {
    flex: 0.85,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  workflowLabelMain: {
    fontSize: 8,
    color: "#64748b",
    width: 140,
    lineHeight: 1.4,
  },
  workflowLabelDate: {
    fontSize: 8,
    color: "#64748b",
    width: 72,
    lineHeight: 1.4,
  },
  // Page 2 Attachment Card
  attachmentCard: {
    marginBottom: 8,
    borderWidth: 0.8,
    borderColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  attachmentHeader: {
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderBottomWidth: 0.8,
    borderLeftWidth: 3.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attachmentTitle: {
    fontSize: 8.5,
    fontWeight: "bold",
  },
  attachmentImageFrame: {
    height: 255,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    margin: 6,
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  attachmentImage: {
    maxWidth: "100%",
    maxHeight: 245,
    objectFit: "contain",
  },
  emptyImageBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },
  emptyImageText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 12,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.8,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
  },
  footerBrand: {
    fontSize: 7,
    color: "#94a3b8",
  },
  footerPage: {
    fontSize: 7,
    color: "#64748b",
    fontWeight: "bold",
  },
});

interface RegistermeterDocPDFProps {
  doc: RegisterMeter;
  billBase64?: string | null;
  idcardBase64?: string | null;
}

export function RegistermeterDocPDF({
  doc,
  billBase64,
  idcardBase64,
}: RegistermeterDocPDFProps) {
  const callStaff = doc.userAcceptMeters?.userCall?.employee;
  const provStaff = doc.userAcceptMeters?.userProvince?.employee;

  const statusName =
    doc.meterStatus?.callcenter ||
    doc.meterStatus?.edlapp ||
    (doc.meterStatusId === 1
      ? "ລໍຖ້າກວດກາ"
      : doc.meterStatusId === 2
        ? "ສົ່ງຕໍ່ໃຫ້ສາຂາ/ເມືອງ"
        : doc.meterStatusId === 3
          ? "ສາຂາຮັບເລື່ອງແລ້ວ"
          : doc.meterStatusId === 4
            ? "ເອກະສານບໍ່ຄົບ"
            : "ປົກກະຕິ");

  const isCompleted = doc.meterStatusId === 3;
  const isRejected = doc.meterStatusId === 4;

  const statusStyle = {
    backgroundColor: isCompleted ? "#ecfdf5" : isRejected ? "#fef2f2" : "#eff6ff",
    color: isCompleted ? "#047857" : isRejected ? "#b91c1c" : "#1d4ed8",
  };

  const formattedDate = moment(doc.createdAt).format("DD/MM/YYYY HH:mm");
  const printDate = moment().format("DD/MM/YYYY HH:mm");

  return (
    <Document>
      {/* ==================== PAGE 1: DOCUMENT DETAILS ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Top Accent Stripe */}
        <View style={styles.accentBar} />

        {/* National Header */}
        <View style={styles.nationalHeader}>
          <Text style={styles.nationalTitle}>
            ສາທາລະນະລັດ ປະຊາທິປະໄຕ ປະຊາຊົນລາວ
          </Text>
          <Text style={styles.nationalMotto}>
            ສັນຕິພາບ ເອກະລາດ ປະຊາທິປະໄຕ ເອກະພາບ ວັດທະນະຖາວອນ
          </Text>
          <Text style={styles.nationalLine}>---=== 000 ===---</Text>
        </View>

        {/* Organization Brand & Metadata Row */}
        <View style={styles.orgHeader}>
          <View>
            <Text style={styles.orgTitle}>ລັດວິສາຫະກິດໄຟຟ້າລາວ</Text>
            <Text style={styles.orgSubtitle}>ສູນບໍລິການລູກຄ້າ 1199</Text>
          </View>

          <View style={styles.metaCard}>
            <View style={styles.metaIdRow}>
              <Text style={styles.metaIdLabel}>ເລກທີຄຳຮ້ອງ:</Text>
              <Text style={styles.metaIdValue}>#{doc.id}</Text>
            </View>
            <Text style={styles.metaDate}>ວັນທີແຈ້ງ: {formattedDate}</Text>
            <Text style={{ ...styles.statusPill, ...statusStyle }}>
              {statusName}
            </Text>
          </View>
        </View>

        {/* Hero Title Banner */}
        <View style={styles.titleBanner}>
          <Text style={styles.bannerMainText}>
            ໃບແຈ້ງຂໍຕິດຕັ້ງໝໍ້ນັບໄຟໃໝ່
          </Text>
          <Text style={styles.bannerSubText}>
            ເອກະສານຄຳຮ້ອງສະເໜີຂໍຕິດຕັ້ງ ແລະ ຂໍ້ມູນກວດກາພາກສະໜາມ
          </Text>
        </View>

        {/* Section 1: Customer Info */}
        <View style={styles.card}>
          <View
            style={{
              ...styles.cardHeader,
              backgroundColor: "#eff6ff",
              borderBottomColor: "#bfdbfe",
              borderLeftColor: "#2563eb",
            }}
          >
            <Text style={{ ...styles.cardTitle, color: "#1e40af" }}>
              1. ຂໍ້ມູນລູກຄ້າຜູ້ຂໍຕິດຕັ້ງ
            </Text>
            <Text
              style={{
                ...styles.cardHeaderBadge,
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
              }}
            >
              ລູກຄ້າທົ່ວໄປ
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.gridRow}>
              <View style={styles.fieldCol2}>
                <Text style={styles.fieldLabel}>ຊື່ ແລະ ນາມສະກຸນ:</Text>
                <Text style={styles.fieldValue}>{doc.fullName || "-"}</Text>
              </View>
              <View style={styles.fieldCol2}>
                <Text style={styles.fieldLabelShort}>ເບີໂທລະສັບ:</Text>
                <Text style={styles.fieldValue}>{doc.phone || "-"}</Text>
              </View>
            </View>
            <View style={styles.gridRowLast}>
              <View style={styles.fieldCol2}>
                <Text style={styles.fieldLabel}>ເລກບັນຊີໃກ້ຄຽງ:</Text>
                <Text style={{ ...styles.fieldValue, color: "#1d4ed8" }}>
                  {doc.accountNear || "-"}
                </Text>
              </View>
              <View style={styles.fieldCol2}>
                <Text style={styles.fieldLabelShort}>ຊ່ອງທາງແຈ້ງ:</Text>
                <Text style={styles.fieldValue}>
                  {doc.sourcetype?.name || "ແອັບໄຟຟ້າລາວ (1199)"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 2: Location Info */}
        <View style={styles.card}>
          <View
            style={{
              ...styles.cardHeader,
              backgroundColor: "#f0fdf4",
              borderBottomColor: "#bbf7d0",
              borderLeftColor: "#16a34a",
            }}
          >
            <Text style={{ ...styles.cardTitle, color: "#15803d" }}>
              2. ສະຖານທີ່ຕິດຕັ້ງໝໍ້ນັບໄຟ
            </Text>
            <Text
              style={{
                ...styles.cardHeaderBadge,
                backgroundColor: "#dcfce7",
                color: "#15803d",
              }}
            >
              ສະຖານທີ່
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.gridRow}>
              <View style={styles.fieldCol3}>
                <Text style={styles.fieldLabelMini}>ແຂວງ:</Text>
                <Text style={styles.fieldValue}>
                  {doc.province?.province_name || "-"}
                </Text>
              </View>
              <View style={styles.fieldCol3}>
                <Text style={styles.fieldLabelMini}>ເມືອງ:</Text>
                <Text style={styles.fieldValue}>
                  {doc.district?.district_name || "-"}
                </Text>
              </View>
              <View style={styles.fieldCol3}>
                <Text style={styles.fieldLabelMini}>ບ້ານ:</Text>
                <Text style={styles.fieldValue}>
                  {doc.village?.village_name || "-"}
                </Text>
              </View>
            </View>
            <View style={styles.gridRowLast}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-start" }}>
                <Text style={{ ...styles.fieldLabel, width: 108 }}>ພິກັດຕຳແໜ່ງ (GPS):</Text>
                <Text style={styles.fieldValue}>
                  {doc.lat && doc.lng ? `${doc.lat}, ${doc.lng}` : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 3: Processing & Workflow */}
        <View style={styles.card}>
          <View
            style={{
              ...styles.cardHeader,
              backgroundColor: "#f8fafc",
              borderBottomColor: "#e2e8f0",
              borderLeftColor: "#475569",
            }}
          >
            <Text style={{ ...styles.cardTitle, color: "#1e293b" }}>
              3. ປະຫວັດການດຳເນີນງານ ແລະ ສົ່ງຕໍ່
            </Text>
            <Text
              style={{
                ...styles.cardHeaderBadge,
                backgroundColor: "#f1f5f9",
                color: "#475569",
              }}
            >
              ຂັ້ນຕອນປະສານງານ
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.gridRow}>
              <View style={styles.workflowColMain}>
                <Text style={styles.workflowLabelMain}>ຜູ້ບັນທຶກເອກະສານ:</Text>
                <Text style={styles.fieldValue}>
                  {doc.createdName || "-"}
                  {doc.createdTel ? ` (ໂທ: ${doc.createdTel})` : ""}
                </Text>
              </View>
              <View style={styles.workflowColDate}>
                <Text style={styles.workflowLabelDate}>ວັນທີສ້າງ:</Text>
                <Text style={styles.fieldValue}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.workflowColMain}>
                <Text style={styles.workflowLabelMain}>ຜູ້ກວດກາ (ສູນ 1199):</Text>
                <Text style={styles.fieldValue}>
                  {callStaff
                    ? `${callStaff.first_name || ""} ${callStaff.last_name || ""} (${callStaff.emp_code || ""})`
                    : "ຍັງບໍ່ທັນກວດກາ"}
                </Text>
              </View>
              <View style={styles.workflowColDate}>
                <Text style={styles.workflowLabelDate}>ວັນທີສົ່ງຕໍ່:</Text>
                <Text style={styles.fieldValue}>
                  {doc.userAcceptMeters?.createdAt
                    ? moment(doc.userAcceptMeters.createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )
                    : "-"}
                </Text>
              </View>
            </View>

            <View style={styles.gridRowLast}>
              <View style={styles.workflowColMain}>
                <Text style={styles.workflowLabelMain}>ສາຂາ/ເມືອງ (ຜູ້ຮັບເລື່ອງ):</Text>
                <Text style={styles.fieldValue}>
                  {provStaff
                    ? `${provStaff.first_name || ""} ${provStaff.last_name || ""} (${provStaff.emp_code || ""})`
                    : "ຍັງບໍ່ທັນຮັບເລື່ອງ"}
                </Text>
              </View>
              <View style={styles.workflowColDate}>
                <Text style={styles.workflowLabelDate}>ວັນທີຮັບເລື່ອງ:</Text>
                <Text style={styles.fieldValue}>
                  {doc.userAcceptMeters?.userProvinceId &&
                    doc.userAcceptMeters?.updatedAt
                    ? moment(doc.userAcceptMeters.updatedAt).format(
                      "DD/MM/YYYY HH:mm"
                    )
                    : "-"}
                </Text>
              </View>
            </View>

            {doc.comment ? (
              <View
                style={{
                  ...styles.gridRowLast,
                  marginTop: 6,
                  paddingTop: 5,
                  borderTopWidth: 0.5,
                  borderTopColor: "#f1f5f9",
                  alignItems: "flex-start",
                }}
              >
                <Text style={{ ...styles.fieldLabel, width: 98, color: "#dc2626" }}>
                  ໝາຍເຫດ/ຄຳເຫັນ:
                </Text>
                <Text style={{ ...styles.fieldValue, color: "#dc2626" }}>
                  {doc.comment}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            ລັດວິສາຫະກິດໄຟຟ້າລາວ
          </Text>
          <Text style={styles.footerPage}>
            ໜ້າ 1 ຈາກ 2 • ພິມວັນທີ: {printDate}
          </Text>
        </View>
      </Page>

      {/* ==================== PAGE 2: ATTACHED IMAGES ==================== */}
      <Page size="A4" style={styles.page}>
        {/* Top Accent Stripe */}
        <View style={styles.accentBar} />

        {/* Page 2 Header */}
        <View style={styles.orgHeader}>
          <View>
            <Text style={styles.orgTitle}>ລັດວິສາຫະກິດໄຟຟ້າລາວ</Text>
            <Text style={styles.orgSubtitle}>
              ສູນບໍລິການລູກຄ້າ 1199 | ເອກະສານຄັດຕິດ
            </Text>
          </View>
        </View>

        {/* Page 2 Title Banner */}
        <View style={styles.titleBanner}>
          <Text style={styles.bannerMainText}>
            ຮູບພາບເອກະສານຄັດຕິດ
          </Text>
          <Text style={styles.bannerSubText}>
            ໃບແຈ້ງບິນໃກ້ຄຽງ ແລະ ບັດປະຈຳຕົວ ຫຼື ສຳມະໂນຄົວ ຂອງຄຳຮ້ອງເລກທີ #{doc.id}
          </Text>
        </View>

        {/* Attachment 1: Bill Near Image */}
        <View style={styles.attachmentCard}>
          <View
            style={{
              ...styles.attachmentHeader,
              backgroundColor: "#eff6ff",
              borderBottomColor: "#bfdbfe",
              borderLeftColor: "#2563eb",
            }}
          >
            <Text style={{ ...styles.attachmentTitle, color: "#1e40af" }}>
              1. ຮູບໃບແຈ້ງບິນໃກ້ຄຽງ
            </Text>
            <Text
              style={{
                ...styles.cardHeaderBadge,
                backgroundColor: "#dbeafe",
                color: "#1d4ed8",
              }}
            >
              ເລກບັນຊີ: {doc.accountNear || "-"}
            </Text>
          </View>
          <View style={styles.attachmentImageFrame}>
            {billBase64 ? (
              <Image src={billBase64} style={styles.attachmentImage} />
            ) : (
              <View style={styles.emptyImageBox}>
                <Text style={styles.emptyImageText}>
                  ບໍ່ມີຮູບພາບໃບແຈ້ງບິນໃກ້ຄຽງຄັດຕິດມາໃນລະບົບ
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Attachment 2: ID Card / Family Book Image */}
        <View style={styles.attachmentCard}>
          <View
            style={{
              ...styles.attachmentHeader,
              backgroundColor: "#f0fdf4",
              borderBottomColor: "#bbf7d0",
              borderLeftColor: "#16a34a",
            }}
          >
            <Text style={{ ...styles.attachmentTitle, color: "#15803d" }}>
              2. ຮູບສຳມະໂນຄົວ ຫຼື ບັດປະຈຳຕົວ
            </Text>
            <Text
              style={{
                ...styles.cardHeaderBadge,
                backgroundColor: "#dcfce7",
                color: "#15803d",
              }}
            >
              ຊື່ຜູ້ແຈ້ງ: {doc.fullName || "-"}
            </Text>
          </View>
          <View style={styles.attachmentImageFrame}>
            {idcardBase64 ? (
              <Image src={idcardBase64} style={styles.attachmentImage} />
            ) : (
              <View style={styles.emptyImageBox}>
                <Text style={styles.emptyImageText}>
                  ບໍ່ມີຮູບພາບສຳມະໂນຄົວ ຫຼື ບັດປະຈຳຕົວຄັດຕິດມາໃນລະບົບ
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            ລັດວິສາຫະກິດໄຟຟ້າລາວ
          </Text>
          <Text style={styles.footerPage}>
            ໜ້າ 2 ຈາກ 2 • ພິມວັນທີ: {printDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

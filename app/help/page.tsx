import Link from "next/link";
import { Card } from "@/components/Card";
import { withBasePath } from "@/lib/base-path";

export default function HelpPage() {
  return (
    <div id="help" className="page active">
      <div className="topbar">
        <Link className="back-btn" href="/">
          <span className="material-symbols-rounded">arrow_back</span>
        </Link>
        <div className="topbar-title">วิธีใช้งาน</div>
      </div>
      <div className="wrap inner-page" style={{ paddingTop: 16, paddingBottom: 4 }}>
        <Card>
          <div className="help-section-head">สำหรับผู้ขอรับบริการ</div>

          <div className="help-step-row">
            <div className="help-num">1</div>
            <div className="help-phone">
              <div style={{ textAlign: "center", marginBottom: 5 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBasePath("/logo.png")} alt="" style={{ width: 20, height: 20, borderRadius: 6, marginBottom: 3 }} />
                <div style={{ fontSize: 6, fontWeight: 600, color: "var(--t2)" }}>งานเวชนิทัศน์ฯ</div>
              </div>
              <div className="hp-btn hp-blue">ขอรับบริการออนไลน์</div>
              <div className="hp-btn hp-glass">ติดตามสถานะงาน</div>
              <div className="hp-btn hp-glass">เข้าสู่ระบบเจ้าหน้าที่</div>
            </div>
            <div>
              <p className="help-title">กดปุ่ม &quot;ขอรับบริการออนไลน์&quot;</p>
              <p className="help-desc">กดปุ่มสีน้ำเงินด้านบนสุดจากหน้าหลัก</p>
            </div>
          </div>

          <div className="help-step-row">
            <div className="help-num">2</div>
            <div className="help-phone">
              <div className="hp-label">ข้อมูลผู้ติดต่อ</div>
              <div className="hp-input" />
              <div className="hp-row"><div className="hp-input" /><div className="hp-input" /></div>
              <div className="hp-label">หน่วยงาน</div>
              <div className="hp-input" />
              <div className="hp-input" />
              <div className="hp-label">รายละเอียดงาน</div>
              <div className="hp-input" />
              <div className="hp-input" />
            </div>
            <div>
              <p className="help-title">กรอกข้อมูลให้ครบทุกช่อง</p>
              <p className="help-desc">
                คำนำหน้า · ชื่อ-นามสกุล · กลุ่มภารกิจ · หน่วยงาน · ประเภทงาน · วันที่สั่ง · รายละเอียด ·
                วันที่ต้องการ · เบอร์ภายใน 4 หลัก
              </p>
            </div>
          </div>

          <div className="help-step-row">
            <div className="help-num">3</div>
            <div className="help-phone">
              <div style={{ textAlign: "center", padding: "6px 0" }}>
                <div
                  style={{
                    width: 24, height: 24, borderRadius: "50%", border: "1.5px solid var(--p)",
                    margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 13, color: "var(--p)", margin: 0 }}>
                    check
                  </span>
                </div>
                <div style={{ fontSize: 7, fontWeight: 600, color: "var(--t1)" }}>ส่งคำขอสำเร็จ</div>
                <div style={{ fontSize: 6, color: "var(--t2)", marginTop: 1 }}>รหัสอ้างอิง</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--p)", lineHeight: 1.2 }}>247</div>
                <div style={{ fontSize: 6, color: "var(--t3)" }}>แคปหน้าจอไว้ด้วยนะ</div>
              </div>
            </div>
            <div>
              <p className="help-title">บันทึกเลขงานไว้ให้ดี</p>
              <p className="help-desc">
                หลังส่งสำเร็จจะได้เลขงาน — <strong>แคปหน้าจอทุกครั้ง</strong> เพื่อใช้ติดตามสถานะ
              </p>
            </div>
          </div>

          <div className="help-step-row">
            <div className="help-num">4</div>
            <div className="help-phone">
              <div className="hp-input" style={{ marginBottom: 4 }} />
              <div className="hp-btn hp-blue" style={{ marginBottom: 6 }}>ค้นหา</div>
              <div className="hp-card" style={{ borderLeft: "2px solid var(--p)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <div className="hp-num">#247</div>
                  <span className="hp-badge hp-do">กำลังทำ</span>
                </div>
                <div className="hp-small">งานป้าย · กลุ่มงานบริหาร</div>
              </div>
            </div>
            <div>
              <p className="help-title">ติดตามสถานะได้ตลอด</p>
              <p className="help-desc">กลับมากด &quot;ติดตามสถานะงาน&quot; แล้วพิมพ์เลขงานหรือชื่อ</p>
            </div>
          </div>

          <div className="help-divider" />
          <div className="help-section-head">สำหรับเจ้าหน้าที่</div>

          <div className="help-step-row">
            <div className="help-num">1</div>
            <div className="help-phone">
              <div style={{ textAlign: "center", marginBottom: 5 }}>
                <div
                  style={{
                    width: 20, height: 20, borderRadius: 6, border: "0.5px solid var(--p)",
                    margin: "0 auto 3px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 12, color: "var(--p)", margin: 0 }}>
                    lock
                  </span>
                </div>
                <div style={{ fontSize: 6, color: "var(--p)", letterSpacing: ".08em" }}>STAFF ACCESS</div>
              </div>
              <div className="hp-input" />
              <div className="hp-input" />
              <div className="hp-btn hp-blue" style={{ marginTop: 4 }}>เข้าสู่ระบบ</div>
            </div>
            <div>
              <p className="help-title">ล็อกอินด้วย Username / Password</p>
              <p className="help-desc">กด &quot;เข้าสู่ระบบเจ้าหน้าที่&quot; จากหน้าหลัก แล้วใส่ข้อมูล</p>
            </div>
          </div>

          <div className="help-step-row">
            <div className="help-num">2</div>
            <div className="help-phone">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                <div style={{ fontSize: 7, fontWeight: 600, color: "var(--t1)" }}>Staff</div>
                <div style={{ position: "relative", display: "inline-flex" }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 14, color: "var(--t2)", margin: 0 }}>
                    notifications
                  </span>
                  <div
                    style={{
                      position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%",
                      background: "#ef4444", fontSize: 5, color: "#fff", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    2
                  </div>
                </div>
              </div>
              <div className="hp-grid">
                <div className="hp-nav-btn">
                  <span className="material-symbols-rounded" style={{ fontSize: 9, margin: 0 }}>list_alt</span>ทั้งหมด
                </div>
                <div className="hp-nav-btn">
                  <span className="material-symbols-rounded" style={{ fontSize: 9, margin: 0 }}>person</span>งานของฉัน
                </div>
                <div className="hp-nav-btn">
                  <span className="material-symbols-rounded" style={{ fontSize: 9, margin: 0 }}>manage_accounts</span>ผู้ใช้
                </div>
                <div className="hp-nav-btn">
                  <span className="material-symbols-rounded" style={{ fontSize: 9, margin: 0 }}>key</span>บัญชีของฉัน
                </div>
              </div>
              <div className="hp-card" style={{ borderLeft: "2px solid #e8c060" }}>
                <div className="hp-num" style={{ color: "#e8c060" }}>#251</div>
                <div className="hp-small">รอรับ · งานวีดีโอ</div>
              </div>
            </div>
            <div>
              <p className="help-title">ตรวจกล่องงาน (กระดิ่ง)</p>
              <p className="help-desc">badge แดงที่กระดิ่งแสดงงานที่รอ — กดดูแล้วกด &quot;รับงาน&quot; เพื่อเริ่มดำเนินการ</p>
            </div>
          </div>

          <div className="help-step-row">
            <div className="help-num">3</div>
            <div className="help-phone">
              <div className="hp-card" style={{ borderLeft: "2px solid #3b82f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <div className="hp-num">#247</div>
                  <span className="hp-badge hp-do">กำลังทำ</span>
                </div>
                <div className="hp-small">งานป้าย · กลุ่มงานบริหาร</div>
                <div className="hp-small">ผู้รับผิดชอบ: สมชาย</div>
              </div>
              <div className="hp-btn hp-glass" style={{ fontSize: 7 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 9, margin: 0 }}>settings</span> จัดการงาน
              </div>
            </div>
            <div>
              <p className="help-title">จัดการและอัปเดตสถานะ</p>
              <p className="help-desc">กด &quot;จัดการงาน&quot; — เปลี่ยนสถานะ มอบหมาย และบันทึกทรัพยากรเมื่องานเสร็จ</p>
            </div>
          </div>

          <div className="help-divider" />

          <div
            style={{
              background: "rgba(124,158,248,.08)", border: "1px solid rgba(124,158,248,.2)",
              borderRadius: "var(--r2)", padding: "14px 15px", marginBottom: 14,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--p)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16, margin: 0 }}>phone_in_talk</span> ติดต่องานเวชนิทัศน์ฯ
            </div>
            <div style={{ fontSize: 14, color: "var(--t1)", fontWeight: 500 }}>037-211-088 ต่อ 2516</div>
            <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 3 }}>วันจันทร์ – วันศุกร์ เวลา 08:30 – 16:30 น.</div>
          </div>

          <div className="help-divider" />
          <div style={{ background: "rgba(255,235,180,.28)", border: "1px solid rgba(255,190,80,.25)", borderRadius: "var(--r2)", padding: "14px 15px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 7, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-rounded" style={{ color: "#d97706", fontSize: 16, margin: 0 }}>lightbulb</span> เคล็ดลับ
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--t2)" }}>
              • ติดตั้งเป็นแอป: iOS → Share → Add to Home Screen<br />
              • Android → เมนู ⋮ → เพิ่มลงในหน้าจอหลัก<br />
              • เบอร์ภายใน = เบอร์โรงพยาบาล 4 หลัก ไม่ใช่มือถือ
            </div>
          </div>
        </Card>
      </div>
      <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
        <span style={{ fontSize: 11, color: "var(--t3)", opacity: 0.5, letterSpacing: ".04em" }}>Developed by Abel</span>
      </div>
    </div>
  );
}

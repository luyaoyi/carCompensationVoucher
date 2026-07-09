const activities = [
  {
    id: "CUST-CAR-001",
    name: "用车客诉代金券赔付",
    bizType: "用车",
    subBizType: "顺风车",
    status: "active",
    issueActivities: {
      normal: "MKT-CAR-NORMAL",
      auxiliaryPresale: "MKT-CAR-AUX-PRE",
      freeIssuePresale: "MKT-CAR-FREE-PRE",
      limitedExclusive: "MKT-CAR-LIMITED",
      smartSubsidyPresale: "MKT-CAR-SMART",
    },
    updatedAt: "2026-07-08 10:20",
  },
  {
    id: "CUST-CAR-002",
    name: "用车赔付灰度活动",
    bizType: "用车",
    subBizType: "接送机",
    status: "active",
    issueActivities: {
      normal: "MKT-GRAY-NORMAL",
      auxiliaryPresale: "",
      freeIssuePresale: "MKT-GRAY-FREE-PRE",
      limitedExclusive: "",
      smartSubsidyPresale: "MKT-GRAY-SMART",
    },
    updatedAt: "2026-07-07 18:05",
  },
];

const voucherKindText = {
  normal: "普通券",
  auxiliaryPresale: "辅营售卖预发券",
  freeIssuePresale: "免费发放预发券",
  limitedExclusive: "限时专享券",
  smartSubsidyPresale: "智能补贴预发券",
};

const compensationRecords = [
  {
    id: "RP202607080001",
    userId: "U102938",
    orderNo: "CAR20260708009",
    refundNo: "CP20260708001",
    createdAt: "2026-07-08 11:20",
    vouchers: [
      {
        sourceVoucherId: "VCH880012",
        voucherKind: "normal",
        amount: 20,
        issueActivityId: "MKT-CAR-NORMAL",
        status: "success",
        newVoucherId: "NVCH900112",
        failReason: "",
      },
      {
        sourceVoucherId: "VCH880013",
        voucherKind: "auxiliaryPresale",
        amount: 10,
        issueActivityId: "MKT-CAR-AUX-PRE",
        status: "success",
        newVoucherId: "NVCH900113",
        failReason: "",
      },
      {
        sourceVoucherId: "VCH880014",
        voucherKind: "freeIssuePresale",
        amount: 15,
        issueActivityId: "MKT-CAR-FREE-PRE",
        status: "success",
        newVoucherId: "NVCH900114",
        failReason: "",
      },
      {
        sourceVoucherId: "VCH880015",
        voucherKind: "limitedExclusive",
        amount: 8,
        issueActivityId: "MKT-CAR-LIMITED",
        status: "success",
        newVoucherId: "NVCH900115",
        failReason: "",
      },
      {
        sourceVoucherId: "VCH880016",
        voucherKind: "smartSubsidyPresale",
        amount: 5,
        issueActivityId: "MKT-CAR-SMART",
        status: "success",
        newVoucherId: "NVCH900116",
        failReason: "",
      },
    ],
  },
  {
    id: "RP202607080002",
    userId: "U837261",
    orderNo: "CAR20260707021",
    refundNo: "CP20260707008",
    createdAt: "2026-07-07 18:05",
    vouchers: [
      {
        sourceVoucherId: "VCH777201",
        voucherKind: "normal",
        amount: 30,
        issueActivityId: "MKT-CAR-NORMAL",
        status: "success",
        newVoucherId: "NVCH900210",
        failReason: "",
      },
      {
        sourceVoucherId: "VCH777202",
        voucherKind: "limitedExclusive",
        amount: 6,
        issueActivityId: "MKT-CAR-LIMITED",
        status: "failed",
        newVoucherId: "",
        failReason: "发券活动调用超时",
      },
    ],
  },
];

let editingActivityId = null;

const statusText = {
  active: "有效",
  inactive: "无效",
  success: "赔付成功",
  failed: "赔付失败",
  partial_failed: "部分失败",
};

const statusClass = {
  active: "ok",
  inactive: "warn",
  success: "ok",
  failed: "fail",
  partial_failed: "warn",
};

const activityTable = document.querySelector("#activityTable");
const recordTable = document.querySelector("#recordTable");
const activityDialog = document.querySelector("#activityDialog");
const activityForm = document.querySelector("#activityForm");
const activityFormError = document.querySelector("#activityFormError");
const infoDialog = document.querySelector("#infoDialog");
const infoTitle = document.querySelector("#infoTitle");
const infoContent = document.querySelector("#infoContent");
const statusFilter = document.querySelector("#statusFilter");
const orderFilter = document.querySelector("#orderFilter");
const userFilter = document.querySelector("#userFilter");
const voucherFilter = document.querySelector("#voucherFilter");
const navItems = document.querySelectorAll(".nav-item");
const pages = document.querySelectorAll(".page");

navItems.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.page));
});

document.querySelector("#createActivityBtn").addEventListener("click", () => {
  editingActivityId = null;
  activityForm.reset();
  activityFormError.textContent = "";
  activityForm.elements.status.value = "active";
  activityForm.elements.bizType.value = "用车";
  activityForm.elements.subBizType.value = "顺风车";
  activityDialog.showModal();
});

statusFilter.addEventListener("change", renderRecords);
orderFilter.addEventListener("input", renderRecords);
userFilter.addEventListener("input", renderRecords);
voucherFilter.addEventListener("input", renderRecords);
document.querySelector("#cancelActivityBtn").addEventListener("click", () => activityDialog.close());
document.querySelector("#closeInfoBtn").addEventListener("click", () => infoDialog.close());

activityForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(activityForm);
  const payload = {
    name: data.get("name").trim(),
    bizType: data.get("bizType"),
    subBizType: data.get("subBizType"),
    status: data.get("status"),
    issueActivities: getIssueActivityPayload(data),
    updatedAt: nowText(),
  };
  activityFormError.textContent = "";

  if (hasActiveConfigConflict(payload.bizType, payload.subBizType, editingActivityId) && payload.status === "active") {
    activityFormError.textContent = "同一业务类型 + 子业务类型仅允许存在一条有效配置";
    return;
  }

  if (editingActivityId) {
    const current = activities.find((item) => item.id === editingActivityId);
    Object.assign(current, payload);
  } else {
    activities.unshift({
      id: `CUST-CAR-${String(activities.length + 1).padStart(3, "0")}`,
      ...payload,
    });
  }

  activityDialog.close();
  render();
});

function render() {
  renderActivities();
  renderRecords();
}

function renderActivities() {
  activityTable.innerHTML = activities
    .map(
      (item) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.bizType}</td>
          <td>${item.subBizType}</td>
          <td><span class="badge ${statusClass[item.status]}">${statusText[item.status]}</span></td>
          <td>${formatMappingSummary(item.issueActivities)}</td>
          <td>${item.updatedAt}</td>
          <td>
            <div class="actions">
              <button class="link-btn" data-edit="${item.id}">编辑</button>
              <button class="link-btn" data-view="${item.id}">查看</button>
              <button class="link-btn" data-log="${item.id}">日志</button>
            </div>
          </td>
        </tr>
      `,
    )
    .join("");

  activityTable.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openEdit(button.dataset.edit));
  });
  activityTable.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => openActivityDetail(button.dataset.view));
  });
  activityTable.querySelectorAll("[data-log]").forEach((button) => {
    button.addEventListener("click", () => openActivityLog(button.dataset.log));
  });
}

function renderRecords() {
  const status = statusFilter.value;
  const orderKeyword = orderFilter.value.trim().toLowerCase();
  const userKeyword = userFilter.value.trim().toLowerCase();
  const voucherKeyword = voucherFilter.value.trim().toLowerCase();
  const list = compensationRecords.filter((item) => {
    const recordStatus = getRecordStatus(item);
    const matchStatus = status === "all" || recordStatus === status;
    const matchOrder = !orderKeyword || item.orderNo.toLowerCase().includes(orderKeyword);
    const matchUser = !userKeyword || item.userId.toLowerCase().includes(userKeyword);
    const matchVoucher =
      !voucherKeyword ||
      item.vouchers.some((voucher) => voucher.sourceVoucherId.toLowerCase().includes(voucherKeyword));
    return matchStatus && matchOrder && matchUser && matchVoucher;
  });

  recordTable.innerHTML = list
    .map((item) => {
      const recordStatus = getRecordStatus(item);
      return `
        <tr>
          <td>${item.id}</td>
          <td>${item.userId}</td>
          <td>${item.orderNo}</td>
          <td>${item.vouchers.length}</td>
          <td><span class="badge ${statusClass[recordStatus]}">${statusText[recordStatus]}</span></td>
          <td>${formatFailReason(item)}</td>
          <td>
            <div class="actions">
              <button class="link-btn" data-record-detail="${item.id}">查看</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  recordTable.querySelectorAll("[data-record-detail]").forEach((button) => {
    button.addEventListener("click", () => openRecordDetail(button.dataset.recordDetail));
  });
}

function openEdit(id) {
  const item = activities.find((activity) => activity.id === id);
  editingActivityId = id;
  activityFormError.textContent = "";
  activityForm.elements.name.value = item.name;
  activityForm.elements.bizType.value = item.bizType;
  activityForm.elements.subBizType.value = item.subBizType;
  activityForm.elements.status.value = item.status;
  setIssueActivityFields(item.issueActivities);
  activityDialog.showModal();
}

function openActivityDetail(id) {
  const item = activities.find((activity) => activity.id === id);
  infoTitle.textContent = "活动详情";
  infoContent.innerHTML = `
    <dl>
      <dt>活动编号</dt><dd>${item.id}</dd>
      <dt>活动名称</dt><dd>${item.name}</dd>
      <dt>业务类型</dt><dd>${item.bizType}</dd>
      <dt>子业务类型</dt><dd>${item.subBizType}</dd>
      <dt>活动状态</dt><dd>${statusText[item.status]}</dd>
      <dt>赔付配置</dt><dd>${formatMappingDetail(item.issueActivities)}</dd>
      <dt>更新时间</dt><dd>${item.updatedAt}</dd>
    </dl>
  `;
  infoDialog.showModal();
}

function openActivityLog(id) {
  const item = activities.find((activity) => activity.id === id);
  infoTitle.textContent = "操作日志";
  infoContent.innerHTML = `
    <ul class="log-list">
      <li><span>${item.updatedAt}</span> 更新活动配置：${item.name}</li>
      <li><span>2026-07-08 09:30</span> 配置券类型对应发券活动</li>
      <li><span>2026-07-08 09:10</span> 创建活动：${item.id}</li>
    </ul>
  `;
  infoDialog.showModal();
}

function reissueVoucher(recordId, sourceVoucherId) {
  const item = compensationRecords.find((record) => record.id === recordId);
  const voucher = item.vouchers.find((current) => current.sourceVoucherId === sourceVoucherId);
  voucher.status = "success";
  voucher.newVoucherId = `NVCH${Math.floor(900000 + Math.random() * 99999)}`;
  voucher.failReason = "";
  render();
  openRecordDetail(recordId);
}

function getIssueActivityPayload(data) {
  return {
    normal: data.get("normalIssueActivityId").trim(),
    auxiliaryPresale: data.get("auxiliaryPresaleActivityId").trim(),
    freeIssuePresale: data.get("freeIssuePresaleActivityId").trim(),
    limitedExclusive: data.get("limitedExclusiveActivityId").trim(),
    smartSubsidyPresale: data.get("smartSubsidyPresaleActivityId").trim(),
  };
}

function hasActiveConfigConflict(bizType, subBizType, currentId) {
  return activities.some(
    (activity) =>
      activity.bizType === bizType &&
      activity.subBizType === subBizType &&
      activity.status === "active" &&
      activity.id !== currentId,
  );
}

function setIssueActivityFields(issueActivities = {}) {
  activityForm.elements.normalIssueActivityId.value = issueActivities.normal || "";
  activityForm.elements.auxiliaryPresaleActivityId.value = issueActivities.auxiliaryPresale || "";
  activityForm.elements.freeIssuePresaleActivityId.value = issueActivities.freeIssuePresale || "";
  activityForm.elements.limitedExclusiveActivityId.value = issueActivities.limitedExclusive || "";
  activityForm.elements.smartSubsidyPresaleActivityId.value = issueActivities.smartSubsidyPresale || "";
}

function formatMappingSummary(issueActivities) {
  const configuredStackCount = Object.entries(issueActivities).filter(([key, value]) => key !== "normal" && value).length;
  return `普通券 ${issueActivities.normal} / 叠加券已配 ${configuredStackCount} 种`;
}

function formatMappingDetail(issueActivities) {
  return Object.entries(issueActivities)
    .map(([key, value]) => `${voucherKindText[key]}：${value || "未配置"}`)
    .join("<br />");
}

function openRecordDetail(id) {
  const item = compensationRecords.find((record) => record.id === id);
  infoTitle.textContent = "赔付明细";
  infoContent.innerHTML = `
    <dl>
      <dt>赔付记录</dt><dd>${item.id}</dd>
      <dt>用户</dt><dd>${item.userId}</dd>
      <dt>订单号</dt><dd>${item.orderNo}</dd>
    </dl>
    <div class="detail-table-wrap">
      <table class="detail-table">
        <thead>
          <tr>
            <th>原券号</th>
            <th>类型</th>
            <th>补发券号</th>
            <th>发放状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${item.vouchers
            .map(
              (voucher) => `
                <tr>
                  <td>${voucher.sourceVoucherId}</td>
                  <td>${voucherKindText[voucher.voucherKind]}</td>
                  <td>${voucher.newVoucherId || "-"}</td>
                  <td>
                    <span class="badge ${statusClass[voucher.status]}">${statusText[voucher.status]}</span>
                    ${voucher.failReason ? `<span class="fail-reason">${voucher.failReason}</span>` : ""}
                  </td>
                  <td>
                    ${
                      voucher.status === "failed"
                        ? `<button class="link-btn" data-reissue-voucher="${item.id}:${voucher.sourceVoucherId}">重新赔付</button>`
                        : "-"
                    }
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
  if (!infoDialog.open) {
    infoDialog.showModal();
  }
  infoContent.querySelectorAll("[data-reissue-voucher]").forEach((button) => {
    const [recordId, sourceVoucherId] = button.dataset.reissueVoucher.split(":");
    button.addEventListener("click", () => reissueVoucher(recordId, sourceVoucherId));
  });
}

function getRecordStatus(record) {
  const failedCount = record.vouchers.filter((voucher) => voucher.status === "failed").length;
  if (failedCount === 0) {
    return "success";
  }
  if (failedCount === record.vouchers.length) {
    return "failed";
  }
  return "partial_failed";
}

function formatFailReason(record) {
  const failed = record.vouchers.filter((voucher) => voucher.status === "failed");
  if (failed.length === 0) {
    return "-";
  }
  return `${failed.length} 张失败`;
}

function formatAmount(amount) {
  return typeof amount === "number" ? `${amount}元` : amount;
}

function nowText() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function switchPage(pageId) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageId);
  });
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });
}

render();

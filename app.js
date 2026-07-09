const activities = [
  {
    id: "CUST-CAR-001",
    name: "用车客诉代金券赔付",
    bizType: "用车",
    status: "active",
    issueActivities: {
      normal: "MKT-CAR-NORMAL",
      stackA: "MKT-CAR-STACK-A",
      stackB: "MKT-CAR-STACK-B",
      stackC: "MKT-CAR-STACK-C",
      stackD: "MKT-CAR-STACK-D",
    },
    updatedAt: "2026-07-08 10:20",
  },
  {
    id: "CUST-CAR-002",
    name: "用车赔付灰度活动",
    bizType: "用车",
    status: "inactive",
    issueActivities: {
      normal: "MKT-GRAY-NORMAL",
      stackA: "MKT-GRAY-STACK-A",
      stackB: "MKT-GRAY-STACK-B",
      stackC: "MKT-GRAY-STACK-C",
      stackD: "MKT-GRAY-STACK-D",
    },
    updatedAt: "2026-07-07 18:05",
  },
];

const voucherKindText = {
  normal: "普通券",
  stackA: "叠加券类型 A",
  stackB: "叠加券类型 B",
  stackC: "叠加券类型 C",
  stackD: "叠加券类型 D",
};

const records = [
  {
    id: "RP202607080001",
    userId: "U102938",
    orderNo: "CAR20260708009",
    sourceVoucherId: "VCH880012",
    voucherType: "满减券",
    voucherKind: "normal",
    amount: 20,
    issueActivityId: "MKT-CAR-NORMAL",
    status: "success",
    newVoucherId: "NVCH900112",
    failReason: "",
  },
  {
    id: "RP202607080002",
    userId: "U102938",
    orderNo: "CAR20260708009",
    sourceVoucherId: "VCH880013",
    voucherType: "满减券",
    voucherKind: "stackA",
    amount: 10,
    issueActivityId: "MKT-CAR-STACK-A",
    status: "failed",
    newVoucherId: "",
    failReason: "指定金额发放超时",
  },
  {
    id: "RP202607080003",
    userId: "U102938",
    orderNo: "CAR20260708009",
    sourceVoucherId: "VCH880014",
    voucherType: "满减券",
    voucherKind: "stackB",
    amount: 15,
    issueActivityId: "MKT-CAR-STACK-B",
    status: "success",
    newVoucherId: "NVCH900113",
    failReason: "",
  },
  {
    id: "RP202607080004",
    userId: "U102938",
    orderNo: "CAR20260708009",
    sourceVoucherId: "VCH880015",
    voucherType: "满减券",
    voucherKind: "stackC",
    amount: 8,
    issueActivityId: "MKT-CAR-STACK-C",
    status: "failed",
    newVoucherId: "",
    failReason: "叠加券类型缺失",
  },
  {
    id: "RP202607080005",
    userId: "U102938",
    orderNo: "CAR20260708009",
    sourceVoucherId: "VCH880016",
    voucherType: "满减券",
    voucherKind: "stackD",
    amount: 5,
    issueActivityId: "MKT-CAR-STACK-D",
    status: "success",
    newVoucherId: "NVCH900114",
    failReason: "",
  },
];

let editingActivityId = null;

const statusText = {
  active: "有效",
  inactive: "无效",
  success: "赔付成功",
  failed: "赔付失败",
  unsupported: "不支持赔付",
};

const statusClass = {
  active: "ok",
  inactive: "warn",
  success: "ok",
  failed: "fail",
  unsupported: "warn",
};

const activityTable = document.querySelector("#activityTable");
const recordTable = document.querySelector("#recordTable");
const activityDialog = document.querySelector("#activityDialog");
const activityForm = document.querySelector("#activityForm");
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
  activityForm.elements.status.value = "active";
  activityForm.elements.bizType.value = "用车";
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
    status: data.get("status"),
    issueActivities: getIssueActivityPayload(data),
    updatedAt: nowText(),
  };

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
  const list = records.filter((item) => {
    const matchStatus = status === "all" || item.status === status;
    const matchOrder = !orderKeyword || item.orderNo.toLowerCase().includes(orderKeyword);
    const matchUser = !userKeyword || item.userId.toLowerCase().includes(userKeyword);
    const matchVoucher = !voucherKeyword || item.sourceVoucherId.toLowerCase().includes(voucherKeyword);
    return matchStatus && matchOrder && matchUser && matchVoucher;
  });

  recordTable.innerHTML = list
    .map(
      (item) => `
        <tr>
          <td>${item.id}</td>
          <td>${item.userId}</td>
          <td>${item.orderNo}</td>
          <td>${item.sourceVoucherId}</td>
          <td>${item.voucherType}</td>
          <td>${voucherKindText[item.voucherKind]}</td>
          <td>${formatAmount(item.amount)}</td>
          <td>${item.issueActivityId}</td>
          <td><span class="badge ${statusClass[item.status]}">${statusText[item.status]}</span></td>
          <td>${item.newVoucherId || "-"}</td>
          <td>${item.failReason || "-"}</td>
          <td>
            <button class="link-btn" data-reissue="${item.id}" ${item.status !== "failed" ? "disabled" : ""}>重新赔付</button>
          </td>
        </tr>
      `,
    )
    .join("");

  recordTable.querySelectorAll("[data-reissue]").forEach((button) => {
    button.addEventListener("click", () => reissue(button.dataset.reissue));
  });
}

function openEdit(id) {
  const item = activities.find((activity) => activity.id === id);
  editingActivityId = id;
  activityForm.elements.name.value = item.name;
  activityForm.elements.bizType.value = item.bizType;
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
      <dt>活动状态</dt><dd>${statusText[item.status]}</dd>
      <dt>发券配置</dt><dd>${formatMappingDetail(item.issueActivities)}</dd>
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

function reissue(id) {
  const item = records.find((record) => record.id === id);
  item.status = "success";
  item.newVoucherId = `NVCH${Math.floor(900000 + Math.random() * 99999)}`;
  item.failReason = "";
  render();
}

function getIssueActivityPayload(data) {
  return {
    normal: data.get("normalIssueActivityId").trim(),
    stackA: data.get("stackAActivityId").trim(),
    stackB: data.get("stackBActivityId").trim(),
    stackC: data.get("stackCActivityId").trim(),
    stackD: data.get("stackDActivityId").trim(),
  };
}

function setIssueActivityFields(issueActivities = {}) {
  activityForm.elements.normalIssueActivityId.value = issueActivities.normal || "";
  activityForm.elements.stackAActivityId.value = issueActivities.stackA || "";
  activityForm.elements.stackBActivityId.value = issueActivities.stackB || "";
  activityForm.elements.stackCActivityId.value = issueActivities.stackC || "";
  activityForm.elements.stackDActivityId.value = issueActivities.stackD || "";
}

function formatMappingSummary(issueActivities) {
  return `普通券 ${issueActivities.normal} / 叠加券 4 类`;
}

function formatMappingDetail(issueActivities) {
  return Object.entries(issueActivities)
    .map(([key, value]) => `${voucherKindText[key]}：${value}`)
    .join("<br />");
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

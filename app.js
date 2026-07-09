const activities = [
  {
    id: "CUST-CAR-001",
    name: "用车客诉代金券赔付",
    bizType: "用车",
    status: "active",
    issueActivityId: "MKT-ISSUE-8891",
    updatedAt: "2026-07-08 10:20",
  },
  {
    id: "CUST-CAR-002",
    name: "用车赔付灰度活动",
    bizType: "用车",
    status: "inactive",
    issueActivityId: "MKT-ISSUE-7720",
    updatedAt: "2026-07-07 18:05",
  },
];

const records = [
  {
    id: "RP202607080001",
    userId: "U102938",
    orderNo: "CAR20260708009",
    sourceVoucherId: "VCH880012",
    voucherType: "满减券",
    amount: 20,
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
    amount: 10,
    status: "failed",
    newVoucherId: "",
    failReason: "指定金额发放超时",
  },
  {
    id: "RP202607080003",
    userId: "U837261",
    orderNo: "CAR20260707021",
    sourceVoucherId: "VCH777201",
    voucherType: "折扣券",
    amount: "8折",
    status: "unsupported",
    newVoucherId: "",
    failReason: "折扣券暂不支持赔付",
  },
  {
    id: "RP202607080004",
    userId: "U556201",
    orderNo: "CAR20260706018",
    sourceVoucherId: "VCH662190",
    voucherType: "满减券",
    amount: 30,
    status: "failed",
    newVoucherId: "",
    failReason: "原券信息查询失败",
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
    issueActivityId: data.get("issueActivityId").trim(),
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
          <td>${item.issueActivityId}</td>
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
          <td>${formatAmount(item.amount)}</td>
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
  activityForm.elements.issueActivityId.value = item.issueActivityId;
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
      <dt>绑定发券活动</dt><dd>${item.issueActivityId}</dd>
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
      <li><span>2026-07-08 09:30</span> 绑定营销平台发券活动：${item.issueActivityId}</li>
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

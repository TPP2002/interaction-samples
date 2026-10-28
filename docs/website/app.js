(() => {
  'use strict';
  const images = {
    scene: {src:'assets/scene.png', alt:'白色陶瓷杯配橙色杯耳，摆放在日照桌面上'},
    plain: {src:'assets/plain.png', alt:'白色陶瓷杯配橙色杯耳的白底原图示意'}
  };
  const image = document.getElementById('product-image');
  const largeImage = document.getElementById('large-image');
  const dialog = document.getElementById('image-dialog');
  document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => {
    const selected = images[button.dataset.image];
    image.src = selected.src;
    image.alt = selected.alt;
    document.querySelectorAll('[data-image]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  }));
  document.getElementById('open-image').addEventListener('click', () => {
    largeImage.src = image.src;
    largeImage.alt = image.alt;
    dialog.showModal();
  });
  document.getElementById('close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom) dialog.close(); } });
  document.querySelectorAll('button[data-theme]').forEach(button => button.addEventListener('click', () => {
    document.body.dataset.theme = button.dataset.theme;
    document.querySelectorAll('button[data-theme]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  }));
  const form = document.getElementById('brief-form');
  const project = document.getElementById('project');
  const requirements = document.getElementById('requirements');
  const status = document.getElementById('brief-status');
  const result = document.getElementById('brief-result');
  const resultText = document.getElementById('brief-text');
  const download = document.getElementById('download-brief');
  let generatedText = '';
  function clearResult() {
    if (generatedText) status.textContent = '内容已修改，请重新生成需求单。';
    generatedText = '';
    result.hidden = true;
    resultText.textContent = '';
    download.disabled = true;
  }
  form.addEventListener('input', clearResult);
  form.addEventListener('change', clearResult);
  function setError(field, text) {
    document.getElementById(field.id+'-error').textContent = text;
    if(text) field.setAttribute('aria-invalid','true'); else field.removeAttribute('aria-invalid');
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    clearResult();
    const title = project.value.trim();
    const content = requirements.value.trim();
    setError(project, title ? '' : '写一下页面名称或用途。');
    setError(requirements, content.length>=10 ? '' : '具体说明至少写 10 个字。');
    if (!title || content.length < 10) {
      status.textContent = '还有必填内容没写好。';
      (!title ? project : requirements).focus();
      return;
    }
    const selected = [...form.querySelectorAll('input[name="feature"]:checked')].map(item=>item.value);
    const deadline = document.getElementById('delivery').value.trim();
    generatedText = [
      '网页需求单',
      '',
      '页面名称或用途：'+title,
      '页面类型：'+document.getElementById('page-type').value,
      '需要的功能：'+(selected.length ? selected.join('、') : '沟通时确认'),
      '希望交付时间：'+(deadline || '沟通时确认'),
      '',
      '具体说明：',
      content,
      '',
      '接单前待确认：页面数量、原图与文案、输出格式、上线环境、修改次数、实际报价和交付时间。',
      '这是沟通用需求单，不是报价单或合同。'
    ].join('\n');
    resultText.textContent = generatedText;
    result.hidden = false;
    download.disabled = false;
    status.textContent = '需求单已生成，可以检查或下载。';
  });
  download.addEventListener('click', () => {
    if (!generatedText) return;
    const blob = new Blob(['\uFEFF'+generatedText], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '网页需求单.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    status.textContent = '已发起下载：网页需求单.txt。';
  });
})();

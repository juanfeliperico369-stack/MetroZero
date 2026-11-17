from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import json,collections
P=Path('/mnt/data/EL_METRO_DOCUMENTO_MAESTRO_COMPLETO.html')
R=Path('/mnt/data/EL_METRO_ARTE_FINAL_v052');html=P.read_text(encoding='utf-8');soup=BeautifulSoup(html,'html.parser')
expected={'c-01':14,'c-02':13,'c-03':3,'c-10':9,'c-11':12,'c-12':20,'c-20':2,'c-21':1,'c-30':16,'c-40':2,'c-41':1,'c-50':21,'c-60':10}
for k,v in expected.items():
 got=len(soup.select(f'#{k} figure.asset'))
 assert got==v,(k,got,v)
assert len(soup.select('.asset'))==124
assert soup.select_one('pre.source-text').get_text().startswith('# EL METRO · DOCUMENTO ÚNICO PARA IA')
assert soup.select_one('pre.source-text').get_text().count('\n')>=9913
assert all(x.get('src','').startswith('data:image/png;base64,') for x in soup.select('img'))
assert not soup.select('script[src],link[rel="stylesheet"],iframe')
errors=[];status={}
with sync_playwright() as pw:
 browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for width,height in [(1366,900),(390,844),(360,780)]:
  page=browser.new_page(viewport={'width':width,'height':height})
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='load',timeout=60000)
  page.locator('#c-40').scroll_into_view_if_needed()
  result=page.evaluate('''async () => {
    const ims=[...document.images];
    ims.forEach(i=>i.loading='eager');
    await Promise.all(ims.map(i=>i.decode().catch(e=>null)));
    return {sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth, imgs:ims.length,broken:ims.filter(i=>i.naturalWidth===0).map(i=>i.alt), title:document.title};
  }''')
  status[str(width)]=result
  assert not result['broken'],result['broken']
  assert result['sw']<=result['cw']+1,(width,result)
  # Screenshot of first view and visual gallery; useful for audit
  if width==1366:page.screenshot(path=str(R/'previews'/'documento_maestro_final_escritorio.png'))
  if width==390:page.screenshot(path=str(R/'previews'/'documento_maestro_final_movil.png'))
  page.close()
 browser.close()
assert not errors,errors
qa=json.loads((R/'documentacion'/'qa_final.json').read_text())
qa['browser_qa']={'screens':status,'errors':errors,'source_all_lines':True,'external_dependencies':False,'images_present_in_html':status['1366']['imgs']}
(R/'documentacion'/'qa_final.json').write_text(json.dumps(qa,indent=2,ensure_ascii=False))
print(json.dumps(status,ensure_ascii=False,indent=2));print('BROWSER OK')

import {test,expect} from '@playwright/test';
import {renderToStaticMarkup} from 'react-dom/server';
import CmsText,{CommonFields,PageFieldsProvider} from '../components/CmsText';
import CmsLink from '../components/CmsLink';
import CmsImage from '../components/CmsImage';
import {textKey} from '../lib/cms/text-key';
import {resolvePageMetadata} from '../lib/cms/page-values';
test('common navigation and page headings have independent bindings',()=>{
  const key=textKey('会社概要');
  const html=renderToStaticMarkup(<PageFieldsProvider scope="company" common={{title:'Common',fields:{[`common.${key}`]:'会社案内'}}} page={{title:'Company',fields:{[`company.${key}`]:'私たちについて'}}}><CommonFields><nav><CmsText>会社概要</CmsText></nav></CommonFields><h1><CmsText>会社概要</CmsText></h1></PageFieldsProvider>);
  expect(html).toContain('<nav>会社案内</nav>');expect(html).toContain('<h1>私たちについて</h1>');
});
test('typed link, image and accessible description reach rendered attributes',()=>{
  const html=renderToStaticMarkup(<PageFieldsProvider scope="company" common={{title:'Common',fields:{}}} page={{title:'Company',fields:{[`company.link_${textKey('/contact')}`]:'/works'},images:{[`image_${textKey('/company-hero.jpg')}`]:{media_id:'00000000-0000-4000-8000-000000000001',alt:'更新した会社の写真'}}}}><CmsLink href="/contact">相談</CmsLink><CmsImage src="/company-hero.jpg" alt="元の写真" width={100} height={100}/></PageFieldsProvider>);
  expect(html).toContain('href="/works"');expect(html).toContain('src="/api/media/00000000-0000-4000-8000-000000000001"');expect(html).toContain('alt="更新した会社の写真"');expect(html).not.toContain('/_next/image');
});
test('common telephone text follows the same stored setting in composed labels',()=>{
  const html=renderToStaticMarkup(<PageFieldsProvider scope="company" common={{title:'Common',fields:{[`common.${textKey('055-939-5036')}`]:'055-000-0000'}}} page={{title:'Company',fields:{}}}><CmsLink href="tel:055-939-5036"><CmsText>TEL 055-939-5036</CmsText></CmsLink></PageFieldsProvider>);
  expect(html).toContain('href="tel:055-000-0000"');expect(html).toContain('TEL 055-000-0000');
});
test('edited metadata reaches page title, description and social metadata',()=>{
  const result=resolvePageMetadata('company',{[`company.${textKey('Company')}`]:'Updated title',[`company.${textKey('Description')}`]:'Updated description'},{title:'Company',description:'Description',alternates:{canonical:'/company'}});
  expect(result.title).toBe('Updated title');expect(result.description).toBe('Updated description');expect(result.openGraph).toMatchObject({title:'Updated title',description:'Updated description'});expect(result.alternates?.canonical).toBe('/company');
});

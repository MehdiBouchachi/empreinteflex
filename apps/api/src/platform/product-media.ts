export function productMediaUrl(assetId:string|null, key:string|null):string|null {
  if(assetId)return `/v1/media/${assetId}`;
  const base=process.env.R2_PUBLIC_URL?.replace(/\/$/,'');
  return base&&key?`${base}/${key}`:null;
}

import fs from 'node:fs';

// A running browser or Windows indexer may map the old build. Replace the file
// atomically instead of truncating that mapped file, and leave identical assets alone.
export function writeBuildFile(file,contents){
 const bytes=Buffer.from(contents);
 if(fs.existsSync(file)&&fs.readFileSync(file).equals(bytes))return;
 const temporary=file+'.build-'+process.pid+'.tmp';
 fs.writeFileSync(temporary,bytes);
 fs.renameSync(temporary,file);
}

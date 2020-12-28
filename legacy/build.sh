#!/bin/bash

echo "Building Pages..."

fileNum=0;
numFiles=0;
for f in data/*.txt; do
  numFiles=$((numFiles + 1));
done

for f in data/*.txt; do
  fileNum=$((fileNum + 1));

  dataline=`cat $f`;
  IFS=$'\n';
  data=($dataline);
  unset IFS;
  
  displayName=${data[0]};
  className=${data[1]};
  color1=${data[2]};
  color2=${data[3]};
  
  template=`cat template.html`;
  template=${template//CSSNAME/$className};
  template=${template//DISPLAYNAME/$displayName};
  template=${template//COLOR1/$color1};
  template=${template//COLOR2/$color2};
  
  if [ "$fileNum" -gt 1 ]; then
    prevFileNum=$((fileNum - 1));
    link="<a href='../$prevFileNum/index.html'><< Previous</a>";
    template=${template//PREVIOUSLINK/$link};
  else
    template=${template//PREVIOUSLINK/};
  fi
  if [ "$fileNum" -lt "$numFiles" ]; then
    nextFileNum=$((fileNum + 1));
    link="<a href='../$nextFileNum/index.html'>Next >></a>";
    template=${template//NEXTLINK/$link};
  else
    template=${template//NEXTLINK/};
  fi
 
  mkdir result/$fileNum
  echo "$template" > result/$fileNum/index.html
done

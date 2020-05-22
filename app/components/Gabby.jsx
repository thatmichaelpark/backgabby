import React, {useEffect, useState} from 'react';

const imgUrls = [
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0663.JPG?1589075504659",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0668.JPG?1589075504618",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0666.JPG?1589075504421",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0659.JPG?1589075504379",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0671.JPG?1589075504297",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0658.JPG?1589075504177",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0656.JPG?1588983890869",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0644.JPG?1588813150406",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0642.JPG?1588518121298",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0633.JPG?1588369371057",
  "https://cdn.glitch.com/894b4ea2-a9a7-4f2f-94e6-bd6d31041cf5%2Fthumbnails%2FIMG_0626.JPG?1588293959498",
];

export default function Gabby() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setI(i => (i + 1) % imgUrls.length);
    }, 3333);
    return () => {
      clearInterval(timer);
    }
  }, []);
  
  return (
    <div className="gabby">
      <img src={imgUrls[i]}/>
    </div>
  );
}
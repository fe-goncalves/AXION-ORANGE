export const resizeImage = (file: File, maxDim: number = 150): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png', 0.8));
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Returns DD/MM/YY
export const formatDateDisplay = (isoDate: string) => {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year.slice(2)}`;
};

export const formatHours = (val: number): string => {
  const hrs = Math.floor(val);
  const mins = Math.round((val - hrs) * 60);
  if (mins === 0) return `${hrs}h`;
  // Pad with 0 if needed (e.g. 1h05), but requirements say "1h30" usually implies simplified
  return `${hrs}h${mins < 10 ? '0' + mins : mins}`;
};

// Mask input value to Currency (e.g. 1000 -> 10,00)
export const maskCurrency = (value: string): string => {
  let v = value.replace(/\D/g, '');
  v = (Number(v) / 100).toFixed(2) + '';
  v = v.replace('.', ',');
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
  return v;
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  // Remove dots (thousands) and replace comma with dot
  const clean = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean);
};
import { useMemo, useRef, useState } from 'react';
import './subir_archivos.css';

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  '.dwg',
  '.dxf',
  '.ifc',
  '.rvt',
  '.skp',
  '.svg',
  '.jpg',
  '.jpeg',
  '.png'
];

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const SubirArchivos = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState('Arrastra archivos o haz clic para seleccionar');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const acceptedMime = useMemo(() => ACCEPTED_FILE_TYPES.join(','), []);

  const handleFiles = (fileList: FileList) => {
    const allowed: File[] = [];
    const rejected: string[] = [];

    Array.from(fileList).forEach((file) => {
      // Check for duplicates
      const isDuplicate = files.some(f => f.name === file.name && f.size === file.size) || 
                          allowed.some(f => f.name === file.name && f.size === file.size);
      
      if (isDuplicate) {
        rejected.push(`${file.name} (duplicado)`);
        return;
      }

      const extension = file.name.toLowerCase().split('.').pop() || '';
      const isPdf = file.type === 'application/pdf';
      const isAcceptedExt = ['dwg', 'dxf', 'ifc', 'rvt', 'skp', 'svg', 'jpg', 'jpeg', 'png'].includes(extension);
      if (isPdf || isAcceptedExt) {
        allowed.push(file);
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length > 0) {
      setMessage(`Se rechazaron estos archivos: ${rejected.join(', ')}`);
    } else {
      setMessage('Archivos listos para subir');
    }

    if (allowed.length > 0) {
      setFiles((current) => [...current, ...allowed]);
      setUploadProgress({});
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFiles(event.dataTransfer.files);
  };

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
    event.target.value = '';
  };

  const openExplorer = () => {
    inputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      setMessage('No hay archivos seleccionados para subir.');
      return;
    }

    setIsUploading(true);
    setMessage(`Subiendo ${files.length} archivo(s)...`);
    
    const initialProgress: Record<string, number> = {};
    files.forEach(f => initialProgress[f.name] = 0);
    setUploadProgress(initialProgress);

    files.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 15) + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(prev => {
          const newProgress = { ...prev, [file.name]: progress };
          if (Object.values(newProgress).every(p => p === 100)) {
             setIsUploading(false);
             setMessage('¡Todos los archivos se han subido con éxito!');
          }
          return newProgress;
        });
      }, 300);
    });
  };

  return (
    <div className="upload-container">
      <header>
        <h1>Subida de PDF y archivos de planos</h1>
        <p>Selecciona archivos PDF, DWG, DXF, IFC, RVT, SKP, SVG o imágenes comunes para planos y líneas de fábrica.</p>
      </header>

      <section className="dropzone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <label htmlFor="file-upload" className="dropzone-label">
          <strong>Haz clic o arrastra los archivos aquí</strong>
          <span>PDF, DWG, DXF, IFC, RVT, SKP, SVG, JPG, PNG</span>
        </label>
        <input
          id="file-upload"
          type="file"
          ref={inputRef}
          multiple
          accept={acceptedMime}
          onChange={handleInput}
          aria-label="Seleccionar archivos para subir"
        />
      </section>

      <div className="controls-row">
        <button className="secondary-button" type="button" onClick={openExplorer} disabled={isUploading}>
          Explorar archivos
        </button>
        <button className="upload-button" type="button" onClick={handleUpload} disabled={isUploading || files.length === 0}>
          {isUploading ? 'Subiendo...' : 'Subir archivos'}
        </button>
      </div>

      <div className="message">{message}</div>

      <section className="files-panel">
        {files.length === 0 ? (
          <div className="empty-state">No hay archivos seleccionados aún.</div>
        ) : (
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${file.size}-${index}`} className="file-item">
                <div className="file-info-container">
                  <div className="file-details">
                    <strong>{file.name}</strong>
                    <span>{formatBytes(file.size)}</span>
                  </div>
                  {uploadProgress[file.name] !== undefined && (
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(index)}
                  disabled={isUploading && uploadProgress[file.name] !== 100}
                >
                  {uploadProgress[file.name] === 100 ? 'Listo' : 'Eliminar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

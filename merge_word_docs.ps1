$folder = "c:\Users\ext_jmena\OneDrive - Falabella\Escritorio\paginas web\clasesonline\TOOLKIT EDITABLE UNIDAD 1-20260518"
$output = "c:\Users\ext_jmena\OneDrive - Falabella\Escritorio\paginas web\clasesonline\Presentacion_Unida.docx"

Write-Host "Iniciando Word..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false

$master = $word.Documents.Add()
$selection = $word.Selection

# Get files, exclude temp files starting with ~$, and sort by name
$files = Get-ChildItem -Path $folder -Filter "*.docx" | Where-Object { $_.Name -notmatch "^\~\$" } | Sort-Object Name

foreach ($file in $files) {
    Write-Host "Uniendo: $($file.Name)"
    $selection.InsertFile($file.FullName)
    # Insertar salto de página entre documentos (opcional, ayuda a mantener el orden visual)
    $selection.InsertBreak(2) 
}

$master.SaveAs([ref]$output)
$master.Close()
$word.Quit()

[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
Write-Host "¡Terminado! Archivo guardado en: $output"

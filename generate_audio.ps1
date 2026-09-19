Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = -1 # slightly relaxed professional pace
$synth.Volume = 100
$synth.SetOutputToWaveFile("d:\PROJECTS\Institue website\pinnacle-frontend\audio\welcome_voice.wav")
$synth.Speak("Dear ladies and gentlemen, welcome to Pinnacle Scholars Academy. Where ambition meets knowledge, and every learner moves closer to excellence. From strong foundations to competitive success, we provide the guidance, discipline, and learning environment needed to reach your pinnacle. Learn with purpose. Grow with confidence. Achieve your future. Pinnacle Scholars Academy - Empowering Futures.")
$synth.Dispose()
Write-Host "Voice audio file generated successfully!"

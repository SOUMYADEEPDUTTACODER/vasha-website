import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { languages } from "@/components/chat/LanguageSelector"

export default function LanguageSupportTable() {
  const indicLanguageCodes = [
    'as','bn','brx','doi','gu','hi','kn','kas_Arab','kas_Deva','gom','mai','ml','mr','mni_Beng','mni_Mtei','npi','or','pa','sa','sat','snd_Arab','snd_Deva','ta','te','ur'
  ]
  const globalLanguageCodes = [
    'en','es','fr','de','it','pt','ru','zh','ja','ko','ar','fa','tr','id'
  ]

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Language Support</CardTitle>
        <CardDescription>
          Compare which models power Global vs Indic languages across ASR, MT, and TTS.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="global">
          <TabsList>
            <TabsTrigger value="global">Global languages</TabsTrigger>
            <TabsTrigger value="indic">Indic languages</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <div className="rounded-lg border border-border/40 bg-card/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Task</TableHead>
                    <TableHead>Primary model(s)</TableHead>
                    <TableHead className="w-[200px]">Fallback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ASR</TableCell>
                    <TableCell>
                      <Badge className="mr-2">Whisper</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">—</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MT</TableCell>
                    <TableCell>
                      <Badge className="mr-2">Meta NLLB</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">Google Translate</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TTS</TableCell>
                    <TableCell>
                      <Badge className="mr-2">Coqui TTS</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">gTTS</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Supported languages</div>
              <div className="flex flex-wrap gap-2">
                {globalLanguageCodes.map(code => (
                  <Badge key={code} variant="outline">{languages[code as keyof typeof languages]}</Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="indic">
            <div className="rounded-lg border border-border/40 bg-card/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Task</TableHead>
                    <TableHead>Primary model(s)</TableHead>
                    <TableHead className="w-[200px]">Fallback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">ASR</TableCell>
                    <TableCell>
                      <Badge className="mr-2" variant="secondary">Indic Conformer</Badge>
                      <Badge className="mr-2">Whisper</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">—</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">MT</TableCell>
                    <TableCell>
                      <Badge className="mr-2" variant="secondary">IndicTrans</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">Google Translate</span>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">TTS</TableCell>
                    <TableCell>
                      <Badge className="mr-2" variant="secondary">Indic Parler</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">gTTS</span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">Supported languages</div>
              <div className="flex flex-wrap gap-2">
                {indicLanguageCodes.map(code => (
                  <Badge key={code} variant="outline">{languages[code as keyof typeof languages]}</Badge>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}



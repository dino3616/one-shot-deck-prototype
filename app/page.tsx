"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Sparkles, Clock, Users } from "lucide-react"

interface Slide {
  id: number
  title: string
  content: string
  type: "title" | "content" | "image" | "conclusion"
  imageUrl?: string
  icon?: string
}

const themes = {
  modern: {
    name: "モダン",
    primary: "bg-gradient-to-br from-blue-600 to-purple-600",
    secondary: "bg-white",
    accent: "text-blue-600",
    description: "クリーンで洗練されたビジネス向けデザイン",
  },
  creative: {
    name: "クリエイティブ",
    primary: "bg-gradient-to-br from-orange-500 to-pink-500",
    secondary: "bg-gray-50",
    accent: "text-orange-600",
    description: "カラフルで創造性を刺激するデザイン",
  },
  minimal: {
    name: "ミニマル",
    primary: "bg-gradient-to-br from-gray-800 to-gray-600",
    secondary: "bg-white",
    accent: "text-gray-800",
    description: "シンプルで集中しやすいデザイン",
  },
}

const mockSlides: Slide[] = [
  {
    id: 1,
    title: "プロジェクト概要",
    content: "OneShot Deck - 5分で完成するプレゼンテーション作成ツール",
    type: "title",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "課題と背景",
    content: "従来のスライド作成は時間がかかりすぎる\n• デザインに悩む時間\n• 構成を考える時間\n• 素材を探す時間",
    type: "content",
    icon: "⚡",
  },
  {
    id: 3,
    title: "ソリューション",
    content:
      "AIが自動でスライド構成を生成\n• キーワード入力だけで完成\n• 3つのテーマから選択\n• 画像・アイコン自動挿入",
    type: "content",
    icon: "🚀",
  },
  {
    id: 4,
    title: "ターゲットユーザー",
    content: "• ビジネスパーソン\n• 学生・研究者\n• プレゼン初心者\n• 時間に追われる人",
    type: "content",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "技術構成",
    content: "• Next.js + TypeScript\n• OpenAI GPT API\n• Unsplash API\n• Tailwind CSS",
    type: "content",
    icon: "⚙️",
  },
  {
    id: 6,
    title: "まとめ",
    content: "5分でプロ品質のスライドを作成\nプレゼンテーションの民主化を実現",
    type: "conclusion",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

export default function OneShotDeck() {
  const [keyword, setKeyword] = useState("")
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof themes>("modern")
  const [isGenerating, setIsGenerating] = useState(false)
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentStep, setCurrentStep] = useState<"input" | "generating" | "preview">("input")

  const handleGenerate = async () => {
    if (!keyword.trim()) return

    setIsGenerating(true)
    setCurrentStep("generating")

    // Simulate API call
    setTimeout(() => {
      setSlides(mockSlides)
      setIsGenerating(false)
      setCurrentStep("preview")
    }, 3000)
  }

  const handleDownload = () => {
    // Simulate download
    alert("スライドをダウンロードしています...")
  }

  const resetForm = () => {
    setKeyword("")
    setSlides([])
    setCurrentStep("input")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OneShot Deck</h1>
                <p className="text-sm text-gray-600">5分でプロ品質のスライドを作成</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>5分で完成</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>誰でも簡単</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === "input" && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">キーワードを入力してスライドを生成</h2>
              <p className="text-lg text-gray-600">
                プレゼンテーションのテーマやキーワードを入力するだけで、 AIが自動的に6枚のスライドを作成します
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <span>スライド生成</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
                    キーワード・テーマ
                  </label>
                  <Input
                    id="keyword"
                    placeholder="例: 新商品発表、プロジェクト提案、研究発表..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="text-lg py-3"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    具体的なキーワードを入力すると、より適切なスライドが生成されます
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">デザインテーマ</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(themes).map(([key, theme]) => (
                      <div
                        key={key}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                          selectedTheme === key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTheme(key as keyof typeof themes)}
                      >
                        <div className={`w-full h-20 rounded-md mb-3 ${theme.primary}`} />
                        <h3 className="font-medium text-gray-900">{theme.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!keyword.trim() || isGenerating}
                  className="w-full py-3 text-lg"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      スライドを生成する
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "generating" && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">スライドを生成中...</h2>
              <p className="text-gray-600">AIがあなたのキーワードを分析して、最適なスライドを作成しています</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" />
                  キーワード「{keyword}」を分析中...
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" />
                  スライド構成を生成中...
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3" />
                  画像とアイコンを選択中...
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3" />
                  デザインを適用中...
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === "preview" && slides.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">生成されたスライド</h2>
                <p className="text-gray-600">
                  キーワード: 「{keyword}」 | テーマ: {themes[selectedTheme].name}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={resetForm}>
                  新しく作成
                </Button>
                <Button onClick={handleDownload} className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>ダウンロード</span>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="grid" className="mb-6">
              <TabsList>
                <TabsTrigger value="grid">グリッド表示</TabsTrigger>
                <TabsTrigger value="single">スライド表示</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slides.map((slide) => (
                    <Card key={slide.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">スライド {slide.id}</Badge>
                          {slide.icon && <span className="text-2xl">{slide.icon}</span>}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div
                          className={`w-full h-32 rounded-md mb-4 flex items-center justify-center ${themes[selectedTheme].primary}`}
                        >
                          {slide.imageUrl ? (
                            <img
                              src={slide.imageUrl || "/placeholder.svg"}
                              alt={slide.title}
                              className="w-full h-full object-cover rounded-md"
                            />
                          ) : (
                            <div className="text-white text-center">
                              <h3 className="font-bold text-lg mb-2">{slide.title}</h3>
                              {slide.icon && <span className="text-3xl">{slide.icon}</span>}
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">{slide.title}</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{slide.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="single" className="mt-6">
                <div className="max-w-4xl mx-auto">
                  <div
                    className={`w-full aspect-video rounded-lg shadow-lg ${themes[selectedTheme].primary} flex items-center justify-center text-white p-8`}
                  >
                    <div className="text-center">
                      <h2 className="text-4xl font-bold mb-4">{slides[0]?.title}</h2>
                      <p className="text-xl opacity-90">{slides[0]?.content}</p>
                    </div>
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    {slides.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${index === 0 ? "bg-blue-600" : "bg-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  )
}

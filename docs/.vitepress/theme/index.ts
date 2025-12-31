import {h, onMounted, watch, nextTick} from 'vue'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import ElementUI from 'element-plus'
import {EnhanceAppContext, useRoute} from "vitepress";
import svgPanZoom from 'svg-pan-zoom'

export default {
    extends:DefaultTheme,
    Layout:()=>h(DefaultTheme.Layout,null,{

    }),
    enhanceApp({app}:EnhanceAppContext){
        app.use(ElementUI)
    },
    setup() {
        const route = useRoute()
        
        const initPanZoom = () => {
            // 创建灯箱元素（如果不存在）
            let lightbox = document.querySelector('.mermaid-lightbox')
            if (!lightbox) {
                lightbox = document.createElement('div')
                lightbox.className = 'mermaid-lightbox'
                lightbox.innerHTML = `
                    <div class="mermaid-lightbox-content"></div>
                    <div class="mermaid-lightbox-close">×</div>
                `
                document.body.appendChild(lightbox)
                
                // 绑定关闭事件
                const closeBtn = lightbox.querySelector('.mermaid-lightbox-close')
                const closeLightbox = () => {
                    lightbox?.classList.remove('active')
                    const content = lightbox?.querySelector('.mermaid-lightbox-content')
                    if (content) content.innerHTML = '' // 清空内容以销毁 svg-pan-zoom 实例
                }
                
                closeBtn?.addEventListener('click', closeLightbox)
                lightbox.addEventListener('click', (e) => {
                    if (e.target === lightbox) closeLightbox()
                })
                
                // ESC 关闭
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
                        closeLightbox()
                    }
                })
            }

            // 对所有 Mermaid SVG 启用平移缩放
            setTimeout(() => {
                document.querySelectorAll('.mermaid svg').forEach((svg: Element) => {
                    if (svg.getAttribute('data-pan-zoom-initialized')) return
                    
                    const container = svg.parentElement
                    if (container) {
                        // 动态计算高度
                        const viewBox = svg.getAttribute('viewBox')
                        if (viewBox) {
                            const [x, y, w, h] = viewBox.split(' ').map(parseFloat)
                            if (w && h) {
                                const aspectRatio = h / w
                                const containerWidth = container.clientWidth || 800
                                let targetHeight = containerWidth * aspectRatio
                                targetHeight = Math.max(400, Math.min(targetHeight, 900))
                                container.style.height = `${targetHeight}px`
                            }
                        }
                        
                        // 添加全屏按钮
                        if (!container.querySelector('.mermaid-fullscreen-btn')) {
                            const btn = document.createElement('div')
                            btn.className = 'mermaid-fullscreen-btn'
                            btn.title = '全屏查看'
                            btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`
                            container.appendChild(btn)
                            
                            btn.addEventListener('click', () => {
                                const lightbox = document.querySelector('.mermaid-lightbox')
                                const content = lightbox?.querySelector('.mermaid-lightbox-content')
                                if (lightbox && content) {
                                    // 克隆 SVG
                                    const clonedSvg = svg.cloneNode(true) as SVGElement
                                    
                                    // 清理克隆 SVG 的属性，移除之前的 pan-zoom 影响
                                    clonedSvg.removeAttribute('data-pan-zoom-initialized')
                                    clonedSvg.removeAttribute('style')
                                    clonedSvg.style.width = '100%'
                                    clonedSvg.style.height = '100%'
                                    
                                    // 移除旧的控制条（关键修复：防止出现两组按钮）
                                    const oldControls = clonedSvg.querySelector('#svg-pan-zoom-controls')
                                    if (oldControls) {
                                        oldControls.remove()
                                    }
                                    
                                    // 移除之前的 viewport 变换组（如果有）
                                    // svg-pan-zoom 会在 svg 内部创建一个 g.svg-pan-zoom_viewport
                                    // 我们需要把里面的内容拿出来，或者直接用原始的 innerHTML 重建
                                    // 更简单的方法是：重新渲染一个干净的 SVG，或者在克隆后清理结构
                                    // 这里尝试直接克隆，svg-pan-zoom 再次初始化通常能处理，或者我们手动清理一下结构
                                    
                                    // 更好的方式：获取原始 SVG 代码（如果可能），或者重置 transform
                                    // 由于 svg-pan-zoom 修改了 DOM 结构，直接克隆会带上 viewport group
                                    // 我们尝试简单粗暴地重置 transform
                                    const viewport = clonedSvg.querySelector('.svg-pan-zoom_viewport')
                                    if (viewport) {
                                        viewport.setAttribute('transform', 'matrix(1,0,0,1,0,0)')
                                        // 移除 style 属性
                                        viewport.removeAttribute('style')
                                    }

                                    content.innerHTML = ''
                                    content.appendChild(clonedSvg)
                                    lightbox.classList.add('active')
                                    
                                    // 在灯箱中初始化 pan-zoom
                                    // 稍微延迟一下确保 DOM 渲染
                                    setTimeout(() => {
                                        try {
                                            svgPanZoom(clonedSvg, {
                                                zoomEnabled: true,
                                                controlIconsEnabled: true,
                                                fit: true,
                                                center: true,
                                                minZoom: 0.1,
                                                maxZoom: 20
                                            })
                                        } catch (e) {
                                            console.warn('Lightbox pan-zoom init failed', e)
                                        }
                                    }, 50)
                                }
                            })
                        }
                    }
                    
                    try {
                        svgPanZoom(svg as SVGElement, {
                            zoomEnabled: true,
                            controlIconsEnabled: true,
                            fit: true,
                            center: true,
                            minZoom: 0.1, // 允许缩小更多
                            maxZoom: 10,
                            zoomScaleSensitivity: 0.3
                        })
                        svg.setAttribute('data-pan-zoom-initialized', 'true')
                    } catch (e) {
                        console.warn('svg-pan-zoom init failed:', e)
                    }
                })
            }, 500) // 等待 Mermaid 渲染完成
        }
        
        onMounted(() => {
            initPanZoom()
        })
        
        watch(
            () => route.path,
            () => nextTick(() => initPanZoom())
        )
    }
}

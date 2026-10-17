import { NAV_ORDER, PLACE_BY_ID, placeColor } from '@/config/places'
import { PLACE_PANEL_ID } from '@/config/ui'
import { usePlacePreview, usePlacePreviewState } from '@/features/layout/placePreview'
import { useCampus, useCampusActions } from '@/state/useCampus'
import s from './hero.module.css'

/**
 * 지도 아래 범례 = 지도를 못 보거나 못 누르는 사람을 위한 같은 메뉴.
 * 누르면 지도에서 그 장소의 미리보기가 열린다. 마우스를 올리면 지도에서 같은 건물이 올라온다.
 */
export function PlaceLegend() {
  const { selected } = useCampus()
  const { open } = usePlacePreviewState()
  const { hover } = useCampusActions()
  const preview = usePlacePreview()

  return (
    <div className="container">
      <ul className={s.legend} aria-label="지도의 장소">
        {NAV_ORDER.map((id) => {
          const place = PLACE_BY_ID[id]
          const current = open && selected === id
          return (
            <li key={id}>
              <button
                type="button"
                className={s.legendItem}
                aria-controls={PLACE_PANEL_ID}
                aria-expanded={current}
                onClick={() => (current ? preview.hide() : preview.show(id))}
                onMouseEnter={() => hover(id)}
                onMouseLeave={() => hover(null)}
                onFocus={() => hover(id)}
                onBlur={() => hover(null)}
              >
                <i className="mark" style={{ ['--c' as string]: placeColor(id) }} aria-hidden="true" />
                <span className={s.legendName}>{place.label}</span>
                <span className={s.legendSub}>{place.sub}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

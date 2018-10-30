import {ModifierDescriptor} from '$studio/componentModel/types'
import commonStylesPrototype from '$studio/componentModel/coreModifierDescriptors/HTML/SetCustomStyle/commonStylesPrototype'
import dictAtom from '$shared/DataVerse/atoms/dictAtom'

const getClass = (propsP, cls) => {
  return cls.extend(commonStylesPrototype).extend({
    reifiedStyles(d) {
      return d.propFromSuper('reifiedStyles').flatMap(reifiedStyles => {
        const ret = propsP
          .prop('pairings')
          .prop('list')
          .flatMap(list => {
            return list.reduce((accDict, pairingId) => {
              const pairingP = propsP
                .prop('pairings')
                .prop('byId')
                .prop(pairingId)

              const keyP = pairingP.prop('key')
              const valueP = pairingP.prop('value')
              return keyP.flatMap((key: string) => {
                return accDict.extend(dictAtom({[key]: valueP}).derivedDict())
              })
            }, reifiedStyles)
          })

        return ret
      })
    },
  })
}

const descriptor: ModifierDescriptor = {
  id: 'TheatreJS/Core/HTML/SetCustomStyle',
  getClass,
}

export default descriptor

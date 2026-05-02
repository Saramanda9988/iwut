import SwiftUI

struct WidgetBackgroundView: View {
    let isEmpty: Bool

    var body: some View {
        VStack {
            Spacer()
            HStack {
                Image("BackgroundLogo")
                    .renderingMode(.original)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 120)
                    .offset(x: -5, y: 10)
                Spacer()
            }
        }

        if isEmpty {
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    Image("EmptyCourseImage")
                        .renderingMode(.original)
                        .resizable()
                        .frame(width: 220, height: 110)
                        .offset(y: 1)
                }
            }
        }
    }
}
